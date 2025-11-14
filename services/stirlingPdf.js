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
}

module.exports = new StirlingPDFService();
