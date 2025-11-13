const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/ai/generate-template
 * @desc    Generate HTML template using AI
 * @access  Private (requires authentication and AI-enabled plan)
 */
router.post('/generate-template', verifyToken, aiController.generateTemplate);

module.exports = router;

