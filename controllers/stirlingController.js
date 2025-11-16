const stirlingPdf = require("../services/stirlingPdf");
const db = require("../config/database");

/**
 * Get Stirling operation limits for user's plan
 */
function getStirlingLimits(planSlug) {
  const limits = {
    trial: { merge: 0, compress: 0, convert: 0, security: 0 },
    starter: { merge: 10, compress: 10, convert: 10, security: 0 },
    professional: { merge: 100, compress: 100, convert: 100, security: 20 },
    business: { merge: -1, compress: -1, convert: -1, security: -1 }, // -1 = unlimited
    superadmin: { merge: -1, compress: -1, convert: -1, security: -1 },
  };

  return limits[planSlug] || limits.trial;
}

/**
 * Check if user has exceeded their Stirling operation limit
 */
async function checkStirlingUsage(userId, operationType, planSlug) {
  const limits = getStirlingLimits(planSlug);

  // Determine which limit category this operation falls under
  let limitCategory;
  if (operationType === "merge") limitCategory = "merge";
  else if (operationType === "compress") limitCategory = "compress";
  else if (["pdf_to_word", "pdf_to_image"].includes(operationType))
    limitCategory = "convert";
  else if (["watermark", "password"].includes(operationType))
    limitCategory = "security";
  else limitCategory = "merge"; // default

  const limit = limits[limitCategory];

  // Unlimited access
  if (limit === -1) {
    return { allowed: true, used: 0, limit: -1 };
  }

  // No access
  if (limit === 0) {
    return { allowed: false, used: 0, limit: 0 };
  }

  // Check current month usage
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [usage] = await db.execute(
    `SELECT COUNT(*) as count 
     FROM stirling_operations 
     WHERE user_id = ? 
     AND operation_type = ? 
     AND DATE_FORMAT(created_at, '%Y-%m') = ?
     AND status = 'success'`,
    [userId, operationType, currentMonth]
  );

  const used = usage[0].count;

  return {
    allowed: used < limit,
    used,
    limit,
  };
}

/**
 * Log Stirling operation
 */
async function logStirlingOperation(
  userId,
  operationType,
  inputFiles,
  inputSize,
  outputSize,
  processingTime,
  status,
  errorMessage = null,
  metadata = {}
) {
  try {
    await db.execute(
      `INSERT INTO stirling_operations 
       (user_id, operation_type, input_files, input_file_size, output_file_size, 
        processing_time, status, error_message, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        operationType,
        inputFiles,
        inputSize,
        outputSize,
        processingTime,
        status,
        errorMessage,
        JSON.stringify(metadata),
      ]
    );

    // Also log to activity_logs
    await db.execute(
      `INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)`,
      [
        userId,
        `stirling_${operationType}`,
        JSON.stringify({
          operation: operationType,
          status,
          inputFiles,
          processingTime,
        }),
      ]
    );
  } catch (error) {
    console.error("Error logging Stirling operation:", error);
  }
}

/**
 * Merge PDFs
 */
exports.mergePDFs = async (req, res) => {
  const startTime = Date.now();

  try {
    // Check if files were uploaded
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 2 PDF files to merge",
      });
    }

    // Check usage limits
    const usage = await checkStirlingUsage(
      req.user.id,
      "merge",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Merge PDFs is not available on your plan. Please upgrade to Starter or higher.",
          requiresUpgrade: true,
          currentPlan: req.subscription.plan_slug,
          availablePlans: ["starter", "professional", "business"],
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly merge limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    // Merge PDFs using Stirling
    const mergedPdf = await stirlingPdf.mergePDFs(req.files);

    const processingTime = Date.now() - startTime;
    const inputSize = req.files.reduce((sum, f) => sum + f.size, 0);

    // Log operation
    await logStirlingOperation(
      req.user.id,
      "merge",
      req.files.length,
      inputSize,
      mergedPdf.length,
      processingTime,
      "success",
      null,
      { fileCount: req.files.length }
    );

    // Send merged PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="merged.pdf"');
    res.send(mergedPdf);
  } catch (error) {
    console.error("Merge PDFs error:", error);

    // Log failed operation
    await logStirlingOperation(
      req.user.id,
      "merge",
      req.files?.length || 0,
      0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to merge PDFs",
      error: error.message,
    });
  }
};

/**
 * Compress PDF
 */
exports.compressPDF = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to compress",
      });
    }

    const usage = await checkStirlingUsage(
      req.user.id,
      "compress",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Compress PDF is not available on your plan. Please upgrade to Starter or higher.",
          requiresUpgrade: true,
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly compress limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const optimizeLevel = parseInt(req.body.optimizeLevel) || 2;
    const compressedPdf = await stirlingPdf.compressPDF(
      req.file,
      optimizeLevel
    );

    const processingTime = Date.now() - startTime;
    const compressionRatio = (
      (1 - compressedPdf.length / req.file.size) *
      100
    ).toFixed(1);

    await logStirlingOperation(
      req.user.id,
      "compress",
      1,
      req.file.size,
      compressedPdf.length,
      processingTime,
      "success",
      null,
      { optimizeLevel, compressionRatio: `${compressionRatio}%` }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="compressed.pdf"'
    );
    res.send(compressedPdf);
  } catch (error) {
    console.error("Compress PDF error:", error);

    await logStirlingOperation(
      req.user.id,
      "compress",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to compress PDF",
      error: error.message,
    });
  }
};

/**
 * Convert PDF to Word
 */
exports.pdfToWord = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to convert",
      });
    }

    const usage = await checkStirlingUsage(
      req.user.id,
      "pdf_to_word",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "PDF to Word is not available on your plan. Please upgrade to Starter or higher.",
          requiresUpgrade: true,
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly conversion limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const wordDoc = await stirlingPdf.pdfToWord(req.file);

    const processingTime = Date.now() - startTime;

    await logStirlingOperation(
      req.user.id,
      "pdf_to_word",
      1,
      req.file.size,
      wordDoc.length,
      processingTime,
      "success"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="converted.docx"'
    );
    res.send(wordDoc);
  } catch (error) {
    console.error("PDF to Word error:", error);

    await logStirlingOperation(
      req.user.id,
      "pdf_to_word",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to convert PDF to Word",
      error: error.message,
    });
  }
};

/**
 * Convert PDF to Image
 */
exports.pdfToImage = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to convert",
      });
    }

    const usage = await checkStirlingUsage(
      req.user.id,
      "pdf_to_image",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "PDF to Image is not available on your plan. Please upgrade to Starter or higher.",
          requiresUpgrade: true,
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly conversion limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const imageFormat = req.body.imageFormat || "png";
    const images = await stirlingPdf.pdfToImage(req.file, imageFormat);

    const processingTime = Date.now() - startTime;

    await logStirlingOperation(
      req.user.id,
      "pdf_to_image",
      1,
      req.file.size,
      images.length,
      processingTime,
      "success",
      null,
      { imageFormat }
    );

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="images.zip"');
    res.send(images);
  } catch (error) {
    console.error("PDF to Image error:", error);

    await logStirlingOperation(
      req.user.id,
      "pdf_to_image",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to convert PDF to images",
      error: error.message,
    });
  }
};

/**
 * Add Watermark to PDF
 */
exports.addWatermark = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    const usage = await checkStirlingUsage(
      req.user.id,
      "watermark",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Watermark feature is not available on your plan. Please upgrade to Professional or higher.",
          requiresUpgrade: true,
          availablePlans: ["professional", "business"],
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly watermark limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const watermarkOptions = {
      text: req.body.watermarkText || "CONFIDENTIAL",
      fontSize: parseInt(req.body.fontSize) || 30,
      rotation: parseInt(req.body.rotation) || 45,
      opacity: parseFloat(req.body.opacity) || 0.5,
      widthSpacer: parseInt(req.body.widthSpacer) || 50,
      heightSpacer: parseInt(req.body.heightSpacer) || 50,
    };

    const watermarkedPdf = await stirlingPdf.addWatermark(
      req.file,
      watermarkOptions
    );

    const processingTime = Date.now() - startTime;

    await logStirlingOperation(
      req.user.id,
      "watermark",
      1,
      req.file.size,
      watermarkedPdf.length,
      processingTime,
      "success",
      null,
      watermarkOptions
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="watermarked.pdf"'
    );
    res.send(watermarkedPdf);
  } catch (error) {
    console.error("Add watermark error:", error);

    await logStirlingOperation(
      req.user.id,
      "watermark",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to add watermark",
      error: error.message,
    });
  }
};

/**
 * Add Password to PDF
 */
exports.addPassword = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a password",
      });
    }

    const usage = await checkStirlingUsage(
      req.user.id,
      "password",
      req.subscription.plan_slug
    );

    if (!usage.allowed) {
      if (usage.limit === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Password protection is not available on your plan. Please upgrade to Professional or higher.",
          requiresUpgrade: true,
          availablePlans: ["professional", "business"],
        });
      }

      return res.status(403).json({
        success: false,
        message: `Monthly password protection limit reached (${usage.limit}). Please upgrade for more operations.`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const permissions = {
      canPrint: req.body.canPrint !== "false",
      canModify: req.body.canModify !== "false",
      canExtract: req.body.canExtract !== "false",
      canFillForm: req.body.canFillForm !== "false",
    };

    const protectedPdf = await stirlingPdf.addPassword(
      req.file,
      req.body.password,
      permissions
    );

    const processingTime = Date.now() - startTime;

    await logStirlingOperation(
      req.user.id,
      "password",
      1,
      req.file.size,
      protectedPdf.length,
      processingTime,
      "success",
      null,
      { permissions }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="protected.pdf"'
    );
    res.send(protectedPdf);
  } catch (error) {
    console.error("Add password error:", error);

    await logStirlingOperation(
      req.user.id,
      "password",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to add password protection",
      error: error.message,
    });
  }
};

/**
 * Auto Redact
 */
exports.autoRedact = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to redact",
      });

    const usage = await checkStirlingUsage(
      req.user.id,
      "watermark",
      req.subscription.plan_slug
    );
    if (!usage.allowed) {
      if (usage.limit === 0)
        return res.status(403).json({
          success: false,
          message: "Auto-redact is not available on your plan.",
          requiresUpgrade: true,
        });
      return res.status(403).json({
        success: false,
        message: `Monthly limit reached (${usage.limit}).`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const options = {
      listOfText: req.body.listOfText || req.body.listOfText,
      useRegex: req.body.useRegex === "true" || req.body.useRegex === true,
      wholeWordSearch:
        req.body.wholeWordSearch === "true" ||
        req.body.wholeWordSearch === true,
      redactColor: req.body.redactColor || "#000000",
      customPadding: req.body.customPadding || "",
      convertPDFToImage:
        req.body.convertPDFToImage === "true" ||
        req.body.convertPDFToImage === true,
    };

    const result = await stirlingPdf.autoRedact(req.file, options);

    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "auto_redact",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="redacted.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Auto redact error:", error);
    await logStirlingOperation(
      req.user.id,
      "auto_redact",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to auto redact PDF",
      error: error.message,
    });
  }
};

/**
 * Manual redact
 */
exports.redact = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to redact",
      });

    const usage = await checkStirlingUsage(
      req.user.id,
      "watermark",
      req.subscription.plan_slug
    );
    if (!usage.allowed) {
      if (usage.limit === 0)
        return res.status(403).json({
          success: false,
          message: "Redact is not available on your plan.",
          requiresUpgrade: true,
        });
      return res.status(403).json({
        success: false,
        message: `Monthly limit reached (${usage.limit}).`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const options = {
      pageNumbers: req.body.pageNumbers || "",
      pageRedactionColor: req.body.pageRedactionColor || "#000000",
      convertPDFToImage:
        req.body.convertPDFToImage === "true" ||
        req.body.convertPDFToImage === true,
    };

    const result = await stirlingPdf.redact(req.file, options);

    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "manual_redact",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="redacted.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Manual redact error:", error);
    await logStirlingOperation(
      req.user.id,
      "manual_redact",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to redact PDF",
      error: error.message,
    });
  }
};

/**
 * Sanitize PDF
 */
exports.sanitizePDF = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file to sanitize",
      });

    const usage = await checkStirlingUsage(
      req.user.id,
      "watermark",
      req.subscription.plan_slug
    );
    if (!usage.allowed) {
      if (usage.limit === 0)
        return res.status(403).json({
          success: false,
          message: "Sanitize is not available on your plan.",
          requiresUpgrade: true,
        });
      return res.status(403).json({
        success: false,
        message: `Monthly limit reached (${usage.limit}).`,
        requiresUpgrade: true,
        used: usage.used,
        limit: usage.limit,
      });
    }

    const options = {
      removeJavaScript:
        req.body.removeJavaScript === "true" ||
        req.body.removeJavaScript === true,
      removeEmbeddedFiles:
        req.body.removeEmbeddedFiles === "true" ||
        req.body.removeEmbeddedFiles === true,
      removeXMPMetadata:
        req.body.removeXMPMetadata === "true" ||
        req.body.removeXMPMetadata === true,
      removeMetadata:
        req.body.removeMetadata === "true" || req.body.removeMetadata === true,
      removeLinks:
        req.body.removeLinks === "true" || req.body.removeLinks === true,
      removeFonts:
        req.body.removeFonts === "true" || req.body.removeFonts === true,
    };

    const result = await stirlingPdf.sanitizePDF(req.file, options);

    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "sanitize",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sanitized.pdf"'
    );
    res.send(result);
  } catch (error) {
    console.error("Sanitize PDF error:", error);
    await logStirlingOperation(
      req.user.id,
      "sanitize",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to sanitize PDF",
      error: error.message,
    });
  }
};

// ---------------- MISC OPERATIONS ----------------

exports.updateMetadata = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });

    const usage = await checkStirlingUsage(
      req.user.id,
      "merge",
      req.subscription.plan_slug
    );
    if (!usage.allowed) {
      if (usage.limit === 0)
        return res.status(403).json({
          success: false,
          message: "Operation not available on your plan.",
          requiresUpgrade: true,
        });
      return res.status(403).json({
        success: false,
        message: `Monthly limit reached (${usage.limit}).`,
        requiresUpgrade: true,
      });
    }

    const options = {
      deleteAll: req.body.deleteAll === "true" || req.body.deleteAll === true,
      author: req.body.author || "",
      title: req.body.title || "",
      subject: req.body.subject || "",
      keywords: req.body.keywords || "",
      allRequestParams: req.body.allRequestParams || "",
    };

    const result = await stirlingPdf.updateMetadata(req.file, options);

    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "update_metadata",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="metadata-updated.pdf"'
    );
    res.send(result);
  } catch (error) {
    console.error("Update metadata error:", error);
    await logStirlingOperation(
      req.user.id,
      "update_metadata",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to update metadata",
      error: error.message,
    });
  }
};

exports.unlockForms = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {};
    const result = await stirlingPdf.unlockForms(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "unlock_forms",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="unlocked.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Unlock forms error:", error);
    await logStirlingOperation(
      req.user.id,
      "unlock_forms",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to unlock forms",
      error: error.message,
    });
  }
};

exports.showJavascript = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const result = await stirlingPdf.showJavascript(req.file);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "show_javascript",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success"
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="javascript.txt"'
    );
    res.send(result);
  } catch (error) {
    console.error("Show javascript error:", error);
    await logStirlingOperation(
      req.user.id,
      "show_javascript",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to extract javascript",
      error: error.message,
    });
  }
};

exports.scannerEffect = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      quality: req.body.quality,
      rotate: req.body.rotate,
      noise: req.body.noise,
    };
    const result = await stirlingPdf.scannerEffect(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "scanner_effect",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="scanned.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Scanner effect error:", error);
    await logStirlingOperation(
      req.user.id,
      "scanner_effect",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to apply scanner effect",
      error: error.message,
    });
  }
};

exports.replaceInvertPdf = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      replaceAndInvertOption: req.body.replaceAndInvertOption,
      backGroundColor: req.body.backGroundColor,
      textColor: req.body.textColor,
    };
    const result = await stirlingPdf.replaceInvertPdf(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "replace_invert",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="replace-invert.pdf"'
    );
    res.send(result);
  } catch (error) {
    console.error("Replace/Invert error:", error);
    await logStirlingOperation(
      req.user.id,
      "replace_invert",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to process replace/invert",
      error: error.message,
    });
  }
};

exports.repairPdf = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const result = await stirlingPdf.repairPdf(req.file);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "repair",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="repaired.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Repair PDF error:", error);
    await logStirlingOperation(
      req.user.id,
      "repair",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to repair PDF",
      error: error.message,
    });
  }
};

exports.removeBlanks = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      threshold: req.body.threshold,
      whitePercent: req.body.whitePercent,
    };
    const result = await stirlingPdf.removeBlanks(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "remove_blanks",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="cleaned.pdf"');
    res.send(result);
  } catch (error) {
    console.error("Remove blanks error:", error);
    await logStirlingOperation(
      req.user.id,
      "remove_blanks",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to remove blank pages",
      error: error.message,
    });
  }
};

exports.ocrPdf = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      languages: req.body.languages,
      sidecar: req.body.sidecar === "true" || req.body.sidecar === true,
      deskew: req.body.deskew === "true" || req.body.deskew === true,
      clean: req.body.clean === "true" || req.body.clean === true,
      cleanFinal:
        req.body.cleanFinal === "true" || req.body.cleanFinal === true,
    };
    const result = await stirlingPdf.ocrPdf(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "ocr",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ocr.pdf"');
    res.send(result);
  } catch (error) {
    console.error("OCR PDF error:", error);
    await logStirlingOperation(
      req.user.id,
      "ocr",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to OCR PDF",
      error: error.message,
    });
  }
};

exports.flattenPdf = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      flattenOnlyForms:
        req.body.flattenOnlyForms === "true" ||
        req.body.flattenOnlyForms === true,
    };
    const result = await stirlingPdf.flattenPdf(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "flatten",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="flattened.pdf"'
    );
    res.send(result);
  } catch (error) {
    console.error("Flatten PDF error:", error);
    await logStirlingOperation(
      req.user.id,
      "flatten",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to flatten PDF",
      error: error.message,
    });
  }
};

exports.extractImages = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please upload a PDF file" });
    const options = {
      format: req.body.format,
      allowDuplicates:
        req.body.allowDuplicates === "true" ||
        req.body.allowDuplicates === true,
    };
    const result = await stirlingPdf.extractImages(req.file, options);
    const processingTime = Date.now() - startTime;
    await logStirlingOperation(
      req.user.id,
      "extract_images",
      1,
      req.file.size,
      result.length,
      processingTime,
      "success",
      null,
      options
    );
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="images.zip"');
    res.send(result);
  } catch (error) {
    console.error("Extract images error:", error);
    await logStirlingOperation(
      req.user.id,
      "extract_images",
      1,
      req.file?.size || 0,
      0,
      Date.now() - startTime,
      "failed",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to extract images",
      error: error.message,
    });
  }
};
