const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Verify JWT token middleware
 */
async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7);
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const [users] = await db.execute(
                'SELECT id, email, full_name, role, is_verified FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            req.user = users[0];
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Verify API key middleware for PDF generation endpoint
 */
async function verifyApiKey(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'] || req.query.api_key;
        
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key is required. Please provide it in X-API-Key header or api_key query parameter.'
            });
        }

        // Get API key details
        const [apiKeys] = await db.execute(
            `SELECT ak.*, u.id as user_id, u.email, u.role, u.is_verified 
             FROM api_keys ak 
             JOIN users u ON ak.user_id = u.id 
             WHERE ak.api_key = ? AND ak.is_active = true`,
            [apiKey]
        );

        if (apiKeys.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive API key.'
            });
        }

        const apiKeyData = apiKeys[0];

        // Check if user is verified
        if (!apiKeyData.is_verified && apiKeyData.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before using the API.'
            });
        }

        // Get user's active subscription
        const [subscriptions] = await db.execute(
            `SELECT us.*, sp.monthly_conversions, sp.slug as plan_slug 
             FROM user_subscriptions us 
             JOIN subscription_plans sp ON us.plan_id = sp.id 
             WHERE us.user_id = ? AND us.status IN ('trial', 'active') 
             ORDER BY us.created_at DESC LIMIT 1`,
            [apiKeyData.user_id]
        );

        if (subscriptions.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No active subscription found. Please subscribe to a plan.'
            });
        }

        const subscription = subscriptions[0];

        // Check if subscription is expired
        const now = new Date();
        if (subscription.status === 'trial' && subscription.trial_ends_at && new Date(subscription.trial_ends_at) < now) {
            return res.status(403).json({
                success: false,
                message: 'Your trial has expired. Please upgrade to a paid plan.'
            });
        }

        if (subscription.status === 'active' && new Date(subscription.current_period_end) < now) {
            return res.status(403).json({
                success: false,
                message: 'Your subscription has expired. Please renew your subscription.'
            });
        }

        // Check payment status for paid plans
        if (subscription.status === 'active' && subscription.payment_status !== 'paid') {
            return res.status(403).json({
                success: false,
                message: 'Payment pending. Please complete your payment to continue using the API.'
            });
        }

        // Check usage limits (skip for superadmin with unlimited plan)
        if (subscription.monthly_conversions !== -1) {
            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
            
            const [usage] = await db.execute(
                'SELECT usage_count FROM api_usage WHERE user_id = ? AND usage_month = ?',
                [apiKeyData.user_id, currentMonth]
            );

            const currentUsage = usage.length > 0 ? usage[0].usage_count : 0;

            if (currentUsage >= subscription.monthly_conversions) {
                return res.status(429).json({
                    success: false,
                    message: `Monthly conversion limit reached (${subscription.monthly_conversions}). Please upgrade your plan.`,
                    usage: {
                        current: currentUsage,
                        limit: subscription.monthly_conversions
                    }
                });
            }
        }

        // Attach user and subscription info to request
        req.apiKey = apiKeyData;
        req.user = {
            id: apiKeyData.user_id,
            email: apiKeyData.email,
            role: apiKeyData.role
        };
        req.subscription = subscription;

        // Update last used timestamp
        await db.execute(
            'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
            [apiKeyData.id]
        );

        next();
    } catch (error) {
        console.error('API key verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Check if user has required role
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions.'
            });
        }

        next();
    };
}

module.exports = {
    verifyToken,
    verifyApiKey,
    requireRole
};

