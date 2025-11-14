const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/database");

/**
 * GET /api/branding/settings
 * Get current user's branding settings
 */
router.get("/settings", verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT branding_settings FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!users[0]) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // MySQL automatically parses JSON columns, so check if it's already an object
    let brandingSettings = users[0].branding_settings;

    if (brandingSettings && typeof brandingSettings === "string") {
      brandingSettings = JSON.parse(brandingSettings);
    }

    res.json({
      success: true,
      data: brandingSettings,
    });
  } catch (error) {
    console.error("Get branding settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch branding settings",
      error: error.message,
    });
  }
});

/**
 * POST /api/branding/settings
 * Update branding settings (Business plan only)
 */
router.post("/settings", verifyToken, async (req, res) => {
  try {
    // Check if user has Business plan
    const [subscriptions] = await db.execute(
      `SELECT sp.slug as plan_slug, sp.name as plan_name
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = ? AND us.status IN ('trial', 'active')
       ORDER BY us.created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!subscriptions[0]) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // Only Business and SuperAdmin plans can use custom branding
    if (!["business", "superadmin"].includes(subscriptions[0].plan_slug)) {
      return res.status(403).json({
        success: false,
        message:
          "Custom branding is only available on Business plan. Please upgrade to access this feature.",
        requiresUpgrade: true,
        currentPlan: subscriptions[0].plan_slug,
        availablePlans: ["business"],
      });
    }

    const { logo_url, company_name, primary_color, secondary_color } = req.body;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Build branding settings object
    const brandingSettings = {
      company_name,
      logo_url: logo_url || null,
      primary_color: primary_color || "#667eea",
      secondary_color: secondary_color || "#764ba2",
      updated_at: new Date().toISOString(),
    };

    // Save to database
    await db.execute("UPDATE users SET branding_settings = ? WHERE id = ?", [
      JSON.stringify(brandingSettings),
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Branding settings updated successfully",
      data: brandingSettings,
    });
  } catch (error) {
    console.error("Update branding settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update branding settings",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/branding/settings
 * Remove branding settings
 */
router.delete("/settings", verifyToken, async (req, res) => {
  try {
    await db.execute("UPDATE users SET branding_settings = NULL WHERE id = ?", [
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Branding settings removed successfully",
    });
  } catch (error) {
    console.error("Delete branding settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove branding settings",
      error: error.message,
    });
  }
});

module.exports = router;
