const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken, checkSubscription } = require("../middleware/auth");
const stirlingController = require("../controllers/stirlingController");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

/**
 * Merge PDFs
 * POST /api/stirling/merge
 * Requires: 2+ PDF files
 * Available: Starter, Professional, Business
 */
router.post(
  "/merge",
  verifyToken,
  checkSubscription,
  upload.array("files", 10), // Max 10 files
  stirlingController.mergePDFs
);

/**
 * Compress PDF
 * POST /api/stirling/compress
 * Requires: 1 PDF file, optimizeLevel (1-3)
 * Available: Starter, Professional, Business
 */
router.post(
  "/compress",
  verifyToken,
  checkSubscription,
  upload.single("file"),
  stirlingController.compressPDF
);

/**
 * Convert PDF to Word
 * POST /api/stirling/pdf-to-word
 * Requires: 1 PDF file
 * Available: Starter, Professional, Business
 */
router.post(
  "/pdf-to-word",
  verifyToken,
  checkSubscription,
  upload.single("file"),
  stirlingController.pdfToWord
);

/**
 * Convert PDF to Image
 * POST /api/stirling/pdf-to-image
 * Requires: 1 PDF file, imageFormat (png/jpg/gif)
 * Available: Starter, Professional, Business
 */
router.post(
  "/pdf-to-image",
  verifyToken,
  checkSubscription,
  upload.single("file"),
  stirlingController.pdfToImage
);

/**
 * Add Watermark to PDF
 * POST /api/stirling/watermark
 * Requires: 1 PDF file, watermark options
 * Available: Professional, Business
 */
router.post(
  "/watermark",
  verifyToken,
  checkSubscription,
  upload.single("file"),
  stirlingController.addWatermark
);

/**
 * Add Password to PDF
 * POST /api/stirling/password
 * Requires: 1 PDF file, password, permissions
 * Available: Professional, Business
 */
router.post(
  "/password",
  verifyToken,
  checkSubscription,
  upload.single("file"),
  stirlingController.addPassword
);

module.exports = router;
