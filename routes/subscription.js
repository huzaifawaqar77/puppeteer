const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Protected routes
router.get('/current', verifyToken, subscriptionController.getCurrentSubscription);
router.post('/change-plan', verifyToken, [
    body('plan_slug').notEmpty().withMessage('Plan slug is required')
], subscriptionController.changePlan);
router.get('/usage-stats', verifyToken, subscriptionController.getUsageStats);

module.exports = router;

