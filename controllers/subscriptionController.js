const db = require('../config/database');

/**
 * Get all subscription plans
 */
async function getPlans(req, res) {
    try {
        const [plans] = await db.execute(
            'SELECT id, name, slug, description, monthly_conversions, price, features FROM subscription_plans WHERE is_active = true AND slug != "superadmin" ORDER BY price ASC'
        );

        res.status(200).json({
            success: true,
            data: plans.map(plan => ({
                ...plan,
                features: JSON.parse(plan.features)
            }))
        });

    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans.'
        });
    }
}

/**
 * Get user's current subscription
 */
async function getCurrentSubscription(req, res) {
    try {
        const userId = req.user.id;

        const [subscriptions] = await db.execute(
            `SELECT us.*, sp.name as plan_name, sp.slug as plan_slug, sp.monthly_conversions, sp.price, sp.features 
             FROM user_subscriptions us 
             JOIN subscription_plans sp ON us.plan_id = sp.id 
             WHERE us.user_id = ? 
             ORDER BY us.created_at DESC LIMIT 1`,
            [userId]
        );

        if (subscriptions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No subscription found.'
            });
        }

        const subscription = subscriptions[0];
        subscription.features = JSON.parse(subscription.features);

        // Get current month usage
        const currentMonth = new Date().toISOString().substring(0, 7);
        const [usage] = await db.execute(
            'SELECT usage_count FROM api_usage WHERE user_id = ? AND usage_month = ?',
            [userId, currentMonth]
        );

        res.status(200).json({
            success: true,
            data: {
                subscription,
                usage: {
                    current_month: currentMonth,
                    conversions_used: usage.length > 0 ? usage[0].usage_count : 0,
                    conversions_limit: subscription.monthly_conversions,
                    percentage_used: subscription.monthly_conversions > 0 
                        ? Math.round((usage.length > 0 ? usage[0].usage_count : 0) / subscription.monthly_conversions * 100)
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription.'
        });
    }
}

/**
 * Upgrade/Change subscription plan
 */
async function changePlan(req, res) {
    const connection = await db.getConnection();
    
    try {
        const userId = req.user.id;
        const { plan_slug } = req.body;

        if (!plan_slug) {
            return res.status(400).json({
                success: false,
                message: 'Plan slug is required.'
            });
        }

        // Get new plan
        const [plans] = await connection.execute(
            'SELECT id, name, slug, price, monthly_conversions FROM subscription_plans WHERE slug = ? AND is_active = true',
            [plan_slug]
        );

        if (plans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found.'
            });
        }

        const newPlan = plans[0];

        // Prevent users from selecting superadmin plan
        if (newPlan.slug === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'This plan is not available.'
            });
        }

        await connection.beginTransaction();

        // Get current subscription
        const [currentSubs] = await connection.execute(
            'SELECT id, plan_id FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (currentSubs.length > 0) {
            // Cancel current subscription
            await connection.execute(
                'UPDATE user_subscriptions SET status = "cancelled" WHERE id = ?',
                [currentSubs[0].id]
            );
        }

        // Create new subscription
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const status = newPlan.price === 0 ? 'trial' : 'active';
        const paymentStatus = newPlan.price === 0 ? 'paid' : 'pending';

        const [result] = await connection.execute(
            'INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, payment_status, next_payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, newPlan.id, status, now, nextMonth, paymentStatus, nextMonth]
        );

        await connection.commit();

        // Log activity
        await db.execute(
            'INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)',
            [userId, 'plan_changed', JSON.stringify({ new_plan: newPlan.slug })]
        );

        res.status(200).json({
            success: true,
            message: `Successfully ${newPlan.price === 0 ? 'activated' : 'upgraded to'} ${newPlan.name} plan!`,
            data: {
                subscription_id: result.insertId,
                plan: newPlan,
                payment_required: newPlan.price > 0
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Change plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change plan. Please try again.'
        });
    } finally {
        connection.release();
    }
}

/**
 * Get usage statistics
 */
async function getUsageStats(req, res) {
    try {
        const userId = req.user.id;
        const { months = 6 } = req.query;

        // Get usage for last N months
        const [usage] = await db.execute(
            `SELECT usage_month, usage_count, endpoint 
             FROM api_usage 
             WHERE user_id = ? 
             ORDER BY usage_month DESC 
             LIMIT ?`,
            [userId, parseInt(months)]
        );

        // Get total usage
        const [total] = await db.execute(
            'SELECT SUM(usage_count) as total_conversions FROM api_usage WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            data: {
                monthly_usage: usage,
                total_conversions: total[0].total_conversions || 0
            }
        });

    } catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage statistics.'
        });
    }
}

module.exports = {
    getPlans,
    getCurrentSubscription,
    changePlan,
    getUsageStats
};

