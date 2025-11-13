const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const db = require("../config/database");

/**
 * @route   PATCH /api/keys/:id/toggle
 * @desc    Toggle API key active/inactive status
 * @access  Private
 */
router.patch("/:id/toggle", verifyToken, async (req, res) => {
  try {
    const keyId = req.params.id;
    const { is_active } = req.body;
    const userId = req.user.id;

    // Validate input
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value",
      });
    }

    // Check if API key belongs to user
    const [apiKeys] = await db.execute(
      "SELECT id, user_id FROM api_keys WHERE id = ?",
      [keyId]
    );

    if (apiKeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    if (apiKeys[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this API key",
      });
    }

    // Update API key status
    await db.execute("UPDATE api_keys SET is_active = ? WHERE id = ?", [
      is_active,
      keyId,
    ]);

    // Log activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)",
      [
        userId,
        "api_key_toggled",
        JSON.stringify({
          api_key_id: keyId,
          is_active: is_active,
        }),
      ]
    );

    res.status(200).json({
      success: true,
      message: `API key ${is_active ? "activated" : "deactivated"} successfully`,
      data: {
        id: keyId,
        is_active: is_active,
      },
    });
  } catch (error) {
    console.error("Error toggling API key:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle API key status",
    });
  }
});

module.exports = router;

