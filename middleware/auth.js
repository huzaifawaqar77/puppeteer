const jwt = require("jsonwebtoken");
const db = require("../config/database");

/**
 * Verify JWT token middleware
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const [users] = await db.execute(
        "SELECT id, email, full_name, role, is_verified FROM users WHERE id = ?",
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        });
      }

      req.user = users[0];
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Verify API key middleware for PDF generation endpoint
 */
async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message:
          "API key is required. Please provide it in X-API-Key header or api_key query parameter.",
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
        message: "Invalid or inactive API key.",
      });
    }

    const apiKeyData = apiKeys[0];

    // Check if user is verified
    if (!apiKeyData.is_verified && apiKeyData.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before using the API.",
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
        message: "No active subscription found. Please subscribe to a plan.",
      });
    }

    const subscription = subscriptions[0];

    // Check if subscription is expired
    const now = new Date();
    if (
      subscription.status === "trial" &&
      subscription.trial_ends_at &&
      new Date(subscription.trial_ends_at) < now
    ) {
      return res.status(403).json({
        success: false,
        message: "Your trial has expired. Please upgrade to a paid plan.",
      });
    }

    if (
      subscription.status === "active" &&
      new Date(subscription.current_period_end) < now
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your subscription has expired. Please renew your subscription.",
      });
    }

    // Check payment status for paid plans
    if (
      subscription.status === "active" &&
      subscription.payment_status !== "paid"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Payment pending. Please complete your payment to continue using the API.",
      });
    }

    // Check usage limits (skip for superadmin with unlimited plan)
    if (subscription.monthly_conversions !== -1) {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

      const [usage] = await db.execute(
        "SELECT usage_count FROM api_usage WHERE user_id = ? AND usage_month = ?",
        [apiKeyData.user_id, currentMonth]
      );

      const currentUsage = usage.length > 0 ? usage[0].usage_count : 0;

      if (currentUsage >= subscription.monthly_conversions) {
        return res.status(429).json({
          success: false,
          message: `Monthly conversion limit reached (${subscription.monthly_conversions}). Please upgrade your plan.`,
          usage: {
            current: currentUsage,
            limit: subscription.monthly_conversions,
          },
        });
      }
    }

    // Attach user and subscription info to request
    req.apiKey = apiKeyData;
    req.user = {
      id: apiKeyData.user_id,
      email: apiKeyData.email,
      role: apiKeyData.role,
    };
    req.subscription = subscription;

    // Update last used timestamp
    await db.execute("UPDATE api_keys SET last_used_at = NOW() WHERE id = ?", [
      apiKeyData.id,
    ]);

    next();
  } catch (error) {
    console.error("API key verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions.",
      });
    }

    next();
  };
}

/**
 * Verify token and check subscription plan for premium features
 * Redirects trial users to upgrade page
 */
async function requirePaidPlan(req, res, next) {
  try {
    // First verify the token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token - redirect to login
      return res.redirect(
        "/login.html?redirect=" + encodeURIComponent(req.originalUrl)
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const [users] = await db.execute(
        "SELECT id, email, full_name, role, is_verified FROM users WHERE id = ?",
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.redirect(
          "/login.html?redirect=" + encodeURIComponent(req.originalUrl)
        );
      }

      req.user = users[0];

      // Get user's subscription
      const [subscriptions] = await db.execute(
        `SELECT us.*, sp.slug as plan_slug, sp.name as plan_name
                 FROM user_subscriptions us
                 JOIN subscription_plans sp ON us.plan_id = sp.id
                 WHERE us.user_id = ? AND us.status IN ('trial', 'active')
                 ORDER BY us.created_at DESC LIMIT 1`,
        [req.user.id]
      );

      if (subscriptions.length === 0) {
        // No subscription - redirect to pricing
        return res.redirect("/index.html#pricing");
      }

      const subscription = subscriptions[0];

      // Check if user is on trial plan
      if (subscription.plan_slug === "trial") {
        // Trial users don't have access to documentation
        return res.status(403).send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Premium Feature - PDF SaaS</title>
                        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                font-family: 'Inter', sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 2rem;
                            }
                            .container {
                                background: white;
                                border-radius: 20px;
                                padding: 3rem;
                                max-width: 600px;
                                text-align: center;
                                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                            }
                            .icon {
                                font-size: 4rem;
                                color: #667eea;
                                margin-bottom: 1.5rem;
                            }
                            h1 {
                                font-size: 2rem;
                                color: #1a202c;
                                margin-bottom: 1rem;
                            }
                            p {
                                color: #4a5568;
                                font-size: 1.1rem;
                                line-height: 1.6;
                                margin-bottom: 2rem;
                            }
                            .features {
                                background: #f7fafc;
                                border-radius: 12px;
                                padding: 1.5rem;
                                margin: 2rem 0;
                                text-align: left;
                            }
                            .features h3 {
                                color: #2d3748;
                                margin-bottom: 1rem;
                                font-size: 1.1rem;
                            }
                            .features ul {
                                list-style: none;
                            }
                            .features li {
                                padding: 0.5rem 0;
                                color: #4a5568;
                            }
                            .features li:before {
                                content: "✓ ";
                                color: #48bb78;
                                font-weight: bold;
                                margin-right: 0.5rem;
                            }
                            .btn {
                                display: inline-block;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 1rem 2rem;
                                border-radius: 10px;
                                text-decoration: none;
                                font-weight: 600;
                                font-size: 1.1rem;
                                transition: transform 0.3s, box-shadow 0.3s;
                                margin: 0.5rem;
                            }
                            .btn:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                            }
                            .btn-secondary {
                                background: white;
                                color: #667eea;
                                border: 2px solid #667eea;
                            }
                            .btn-secondary:hover {
                                background: #f7fafc;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h1>Premium Feature</h1>
                            <p>
                                The API Documentation is a premium feature available to our paid subscribers.
                                Upgrade your plan to access comprehensive API documentation, code examples, and integration guides.
                            </p>

                            <div class="features">
                                <h3>What you'll get with a paid plan:</h3>
                                <ul>
                                    <li>Full API documentation access</li>
                                    <li>Interactive code examples</li>
                                    <li>More PDF conversions per month</li>
                                    <li>Email support</li>
                                    <li>High-quality PDF output</li>
                                </ul>
                            </div>

                            <div>
                                <a href="/dashboard.html#subscription" class="btn">
                                    <i class="fas fa-arrow-up"></i> Upgrade Now
                                </a>
                                <a href="/dashboard.html" class="btn btn-secondary">
                                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                                </a>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
      }

      // User has paid plan - allow access
      req.subscription = subscription;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.redirect(
          "/login.html?redirect=" + encodeURIComponent(req.originalUrl)
        );
      }
      return res.redirect(
        "/login.html?redirect=" + encodeURIComponent(req.originalUrl)
      );
    }
  } catch (error) {
    console.error("Paid plan verification error:", error);
    return res.status(500).send("Internal server error");
  }
}

module.exports = {
  verifyToken,
  verifyApiKey,
  requireRole,
  requirePaidPlan,
};
