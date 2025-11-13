const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/database");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../utils/email");

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * Generate API key
 */
function generateApiKey() {
  return "sk_" + crypto.randomBytes(32).toString("hex");
}

/**
 * Register new user
 */
async function register(req, res) {
  const connection = await db.getConnection();

  try {
    const { email, password, full_name } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required.",
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await connection.beginTransaction();

    // Create user
    const [userResult] = await connection.execute(
      "INSERT INTO users (email, password, full_name, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, full_name, verificationToken, verificationExpires]
    );

    const userId = userResult.insertId;

    // Get trial plan
    const [plans] = await connection.execute(
      "SELECT id FROM subscription_plans WHERE slug = ?",
      ["trial"]
    );

    if (plans.length === 0) {
      throw new Error("Trial plan not found");
    }

    const trialPlanId = plans[0].id;

    // Create trial subscription
    const trialDays = parseInt(process.env.TRIAL_DAYS) || 14;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, trialPlanId, "trial", trialEnd, now, trialEnd]
    );

    await connection.commit();

    // Send verification email
    try {
      await sendVerificationEmail(email, full_name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        email,
        full_name,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  } finally {
    connection.release();
  }
}

/**
 * Verify email
 */
async function verifyEmail(req, res) {
  const connection = await db.getConnection();

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    // Find user with valid token
    const [users] = await connection.execute(
      "SELECT id, email, full_name, is_verified FROM users WHERE verification_token = ? AND verification_token_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    const user = users[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified.",
      });
    }

    await connection.beginTransaction();

    // Update user as verified
    await connection.execute(
      "UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = ?",
      [user.id]
    );

    // Generate API key
    const apiKey = generateApiKey();
    await connection.execute(
      "INSERT INTO api_keys (user_id, api_key, name) VALUES (?, ?, ?)",
      [user.id, apiKey, "Default API Key"]
    );

    await connection.commit();

    // Send welcome email with API key
    try {
      await sendWelcomeEmail(user.email, user.full_name, apiKey);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(200).json({
      success: true,
      message:
        "Email verified successfully! Check your email for your API key.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed. Please try again.",
    });
  } finally {
    connection.release();
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const [users] = await db.execute(
      "SELECT id, email, password, full_name, is_verified, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Log activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
      [user.id, "login", req.ip]
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_verified: user.is_verified,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
}

/**
 * Request password reset
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find user
    const [users] = await db.execute(
      "SELECT id, email, full_name FROM users WHERE email = ?",
      [email]
    );

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await db.execute(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, resetExpires, user.id]
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.full_name, resetToken);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request. Please try again.",
    });
  }
}

/**
 * Reset password
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    // Find user with valid token
    const [users] = await db.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    // Update password and clear reset token
    await db.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successful! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed. Please try again.",
    });
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // Get user details
    const [users] = await db.execute(
      "SELECT id, email, full_name, role, is_verified, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Get subscription details
    const [subscriptions] = await db.execute(
      `SELECT us.*, sp.name as plan_name, sp.slug as plan_slug, sp.monthly_conversions, sp.price
             FROM user_subscriptions us
             JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE us.user_id = ?
             ORDER BY us.created_at DESC LIMIT 1`,
      [userId]
    );

    // Get API keys
    const [apiKeys] = await db.execute(
      "SELECT id, api_key, name, is_active, last_used_at, created_at FROM api_keys WHERE user_id = ?",
      [userId]
    );

    // Get current month usage
    const currentMonth = new Date().toISOString().substring(0, 7);
    const [usage] = await db.execute(
      "SELECT usage_count FROM api_usage WHERE user_id = ? AND usage_month = ?",
      [userId, currentMonth]
    );

    res.status(200).json({
      success: true,
      data: {
        user: users[0],
        subscription: subscriptions.length > 0 ? subscriptions[0] : null,
        api_keys: apiKeys,
        usage: {
          current_month: currentMonth,
          conversions_used: usage.length > 0 ? usage[0].usage_count : 0,
          conversions_limit:
            subscriptions.length > 0 ? subscriptions[0].monthly_conversions : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
};
