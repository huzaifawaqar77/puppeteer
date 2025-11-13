const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pdfController = require('../controllers/pdfController');
const { verifyApiKey } = require('../middleware/auth');

// Validation middleware
const validateGeneratePdf = [
    body('html').notEmpty().withMessage('HTML content is required')
];

const validateGeneratePdfFromUrl = [
    body('url').isURL().withMessage('Valid URL is required')
];

// All PDF routes require API key
router.post('/generate', verifyApiKey, validateGeneratePdf, pdfController.generatePdf);
router.post('/generate-from-url', verifyApiKey, validateGeneratePdfFromUrl, pdfController.generatePdfFromUrl);

module.exports = router;

