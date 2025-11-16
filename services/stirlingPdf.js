const FormData = require("form-data");
const axios = require("axios");

/**
 * Stirling PDF Service
 * Wrapper for Stirling PDF API at pdf.uiflexer.com
 */
class StirlingPDFService {
  constructor() {
    this.baseURL = process.env.STIRLING_PDF_URL || "https://pdf.uiflexer.com";
    this.apiKey = process.env.STIRLING_API_KEY;

    if (!this.apiKey) {
      console.warn(
        "⚠️  STIRLING_API_KEY not set in environment variables. Stirling PDF features will not work."
      );
    }
  }

  /**
   * Merge multiple PDFs into one
   * @param {Array} files - Array of file objects with buffer and originalname
   * @returns {Buffer} Merged PDF buffer
   */
  async mergePDFs(files) {
    try {
      const formData = new FormData();

      // Add all PDF files to form data
      files.forEach((file) => {
        formData.append("fileInput", file.buffer, {
          filename: file.originalname,
          contentType: "application/pdf",
        });
      });

      const response = await axios.post(
        `${this.baseURL}/api/v1/general/merge-pdfs`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 60000, // 60 second timeout
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF merge error:", error.message);
      throw new Error(
        `Failed to merge PDFs: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Compress PDF to reduce file size
   * @param {Object} file - File object with buffer and originalname
   * @param {Number} optimizeLevel - Compression level (1-3, default: 2)
   * @returns {Buffer} Compressed PDF buffer
   */
  async compressPDF(file, optimizeLevel = 2) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      formData.append("optimizeLevel", optimizeLevel.toString());

      const response = await axios.post(
        `${this.baseURL}/api/v1/general/compress-pdf`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 60000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF compress error:", error.message);
      throw new Error(
        `Failed to compress PDF: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Convert PDF to Word document
   * @param {Object} file - File object with buffer and originalname
   * @returns {Buffer} Word document buffer
   */
  async pdfToWord(file) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      formData.append("outputFormat", "docx");

      const response = await axios.post(
        `${this.baseURL}/api/v1/convert/pdf/word`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 120000, // 2 minute timeout for conversion
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF to Word error:", error.message);
      throw new Error(
        `Failed to convert PDF to Word: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Convert PDF to images
   * @param {Object} file - File object with buffer and originalname
   * @param {String} imageFormat - Image format (png, jpg, gif)
   * @returns {Buffer} ZIP file containing images
   */
  async pdfToImage(file, imageFormat = "png") {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });

      // Required parameters
      formData.append("pageNumbers", "all"); // Required - convert all pages
      formData.append("imageFormat", String(imageFormat)); // Required
      formData.append("singleOrMultiple", "multiple"); // Required
      formData.append("colorType", "rgb"); // Required - rgb, greyscale, or blackwhite
      formData.append("dpi", "300"); // Required - DPI for output images

      const response = await axios.post(
        `${this.baseURL}/api/v1/convert/pdf/img`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF to Image error:", error.message);
      if (error.response?.data) {
        console.error("Response data:", error.response.data.toString());
      }
      throw new Error(
        `Failed to convert PDF to images: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Add watermark to PDF
   * @param {Object} file - File object with buffer and originalname
   * @param {Object} options - Watermark options
   * @returns {Buffer} Watermarked PDF buffer
   */
  async addWatermark(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });

      // Required parameters
      formData.append("watermarkType", options.type || "text");
      formData.append("convertPDFToImage", "false"); // Required parameter

      // Text watermark options
      if (!options.type || options.type === "text") {
        formData.append("watermarkText", options.text || "CONFIDENTIAL");
        formData.append("fontSize", String(options.fontSize || 30));
        formData.append("alphabet", "roman");
        formData.append("customColor", options.color || "#000000"); // Required - default black
      }

      // Common options
      formData.append("rotation", String(options.rotation || 45));
      formData.append("opacity", String(options.opacity || 0.5));
      formData.append("widthSpacer", String(options.widthSpacer || 50));
      formData.append("heightSpacer", String(options.heightSpacer || 50));

      const response = await axios.post(
        `${this.baseURL}/api/v1/security/add-watermark`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 60000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF add watermark error:", error.message);
      if (error.response?.data) {
        console.error("Response data:", error.response.data.toString());
      }
      throw new Error(
        `Failed to add watermark: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Add password protection to PDF
   * @param {Object} file - File object with buffer and originalname
   * @param {String} password - Password to protect PDF
   * @param {Object} permissions - PDF permissions
   * @returns {Buffer} Password-protected PDF buffer
   */
  async addPassword(file, password, permissions = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });

      // All values must be strings
      formData.append("password", String(password));
      formData.append("keyLength", "256");
      formData.append(
        "canAssembleDocument",
        String(permissions.canAssemble !== false)
      );
      formData.append(
        "canExtractContent",
        String(permissions.canExtract !== false)
      );
      formData.append(
        "canExtractForAccessibility",
        String(permissions.canExtractForAccessibility !== false)
      );
      formData.append(
        "canFillInForm",
        String(permissions.canFillForm !== false)
      );
      formData.append("canModify", String(permissions.canModify !== false));
      formData.append(
        "canModifyAnnotations",
        String(permissions.canModifyAnnotations !== false)
      );
      formData.append("canPrint", String(permissions.canPrint !== false));
      formData.append(
        "canPrintFaithful",
        String(permissions.canPrintFaithful !== false)
      );

      const response = await axios.post(
        `${this.baseURL}/api/v1/security/add-password`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 60000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling PDF add password error:", error.message);
      if (error.response?.data) {
        console.error("Response data:", error.response.data.toString());
      }
      throw new Error(
        `Failed to add password: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Auto redact (pattern based)
   */
  async autoRedact(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });

      // attach all options as strings
      if (options.listOfText)
        formData.append("listOfText", String(options.listOfText));
      if (typeof options.useRegex !== "undefined")
        formData.append("useRegex", String(options.useRegex));
      if (typeof options.wholeWordSearch !== "undefined")
        formData.append("wholeWordSearch", String(options.wholeWordSearch));
      if (options.redactColor)
        formData.append("redactColor", String(options.redactColor));
      if (options.customPadding)
        formData.append("customPadding", String(options.customPadding));
      if (typeof options.convertPDFToImage !== "undefined")
        formData.append("convertPDFToImage", String(options.convertPDFToImage));

      const response = await axios.post(
        `${this.baseURL}/api/v1/security/auto-redact`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling auto redact error:", error.message);
      throw new Error(
        `Failed to auto redact: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Manual redact (page numbers)
   */
  async redact(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.pageNumbers)
        formData.append("pageNumbers", String(options.pageNumbers));
      if (options.pageRedactionColor)
        formData.append(
          "pageRedactionColor",
          String(options.pageRedactionColor)
        );
      if (typeof options.convertPDFToImage !== "undefined")
        formData.append("convertPDFToImage", String(options.convertPDFToImage));

      const response = await axios.post(
        `${this.baseURL}/api/v1/security/redact`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling manual redact error:", error.message);
      throw new Error(
        `Failed to redact: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Sanitize PDF
   */
  async sanitizePDF(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      // Boolean flags
      [
        "removeJavaScript",
        "removeEmbeddedFiles",
        "removeXMPMetadata",
        "removeMetadata",
        "removeLinks",
        "removeFonts",
      ].forEach((k) => {
        if (typeof options[k] !== "undefined")
          formData.append(k, String(options[k]));
      });

      const response = await axios.post(
        `${this.baseURL}/api/v1/security/sanitize-pdf`,
        formData,
        {
          headers: {
            "X-API-Key": this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling sanitize error:", error.message);
      throw new Error(
        `Failed to sanitize PDF: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /* ------------------ MISC Operations ------------------ */

  async updateMetadata(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (typeof options.deleteAll !== "undefined")
        formData.append("deleteAll", String(options.deleteAll));
      if (options.author) formData.append("author", String(options.author));
      if (options.title) formData.append("title", String(options.title));
      if (options.subject) formData.append("subject", String(options.subject));
      if (options.keywords)
        formData.append("keywords", String(options.keywords));
      if (options.allRequestParams)
        formData.append("allRequestParams", String(options.allRequestParams));

      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/update-metadata`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling update metadata error:", error.message);
      throw new Error(
        `Failed to update metadata: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async unlockForms(file) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/unlock-pdf-forms`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling unlock forms error:", error.message);
      throw new Error(
        `Failed to unlock forms: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async showJavascript(file) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/show-javascript`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling show javascript error:", error.message);
      throw new Error(
        `Failed to extract javascript: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async scannerEffect(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.quality) formData.append("quality", String(options.quality));
      if (options.rotate) formData.append("rotate", String(options.rotate));
      if (options.noise) formData.append("noise", String(options.noise));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/scanner-effect`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling scanner effect error:", error.message);
      throw new Error(
        `Failed to apply scanner effect: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async replaceInvertPdf(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.replaceAndInvertOption)
        formData.append(
          "replaceAndInvertOption",
          String(options.replaceAndInvertOption)
        );
      if (options.backGroundColor)
        formData.append("backGroundColor", String(options.backGroundColor));
      if (options.textColor)
        formData.append("textColor", String(options.textColor));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/replace-invert-pdf`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling replace/invert error:", error.message);
      throw new Error(
        `Failed to process replace/invert: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async repairPdf(file) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/repair`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling repair error:", error.message);
      throw new Error(
        `Failed to repair PDF: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async removeBlanks(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.threshold)
        formData.append("threshold", String(options.threshold));
      if (options.whitePercent)
        formData.append("whitePercent", String(options.whitePercent));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/remove-blanks`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling remove blanks error:", error.message);
      throw new Error(
        `Failed to remove blanks: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async ocrPdf(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.languages)
        formData.append("languages", String(options.languages));
      if (typeof options.sidecar !== "undefined")
        formData.append("sidecar", String(options.sidecar));
      if (typeof options.deskew !== "undefined")
        formData.append("deskew", String(options.deskew));
      if (typeof options.clean !== "undefined")
        formData.append("clean", String(options.clean));
      if (typeof options.cleanFinal !== "undefined")
        formData.append("cleanFinal", String(options.cleanFinal));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/ocr-pdf`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 300000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling OCR error:", error.message);
      throw new Error(
        `Failed to OCR PDF: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async flattenPdf(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (typeof options.flattenOnlyForms !== "undefined")
        formData.append("flattenOnlyForms", String(options.flattenOnlyForms));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/flatten`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling flatten error:", error.message);
      throw new Error(
        `Failed to flatten PDF: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async extractImages(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("fileInput", file.buffer, {
        filename: file.originalname,
        contentType: "application/pdf",
      });
      if (options.format) formData.append("format", String(options.format));
      if (typeof options.allowDuplicates !== "undefined")
        formData.append("allowDuplicates", String(options.allowDuplicates));
      const response = await axios.post(
        `${this.baseURL}/api/v1/misc/extract-images`,
        formData,
        {
          headers: { "X-API-Key": this.apiKey, ...formData.getHeaders() },
          responseType: "arraybuffer",
          timeout: 120000,
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Stirling extract images error:", error.message);
      throw new Error(
        `Failed to extract images: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

module.exports = new StirlingPDFService();
