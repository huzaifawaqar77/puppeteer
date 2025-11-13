const puppeteer = require("puppeteer-core");
const db = require("../config/database");

/**
 * Track API usage
 */
async function trackUsage(userId, apiKeyId, endpoint) {
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  try {
    // Check if usage record exists for this month
    const [existing] = await db.execute(
      "SELECT id, usage_count FROM api_usage WHERE user_id = ? AND usage_month = ?",
      [userId, currentMonth]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        "UPDATE api_usage SET usage_count = usage_count + 1, last_used_at = NOW(), api_key_id = ? WHERE id = ?",
        [apiKeyId, existing[0].id]
      );
    } else {
      // Create new record
      await db.execute(
        "INSERT INTO api_usage (user_id, api_key_id, endpoint, usage_month, usage_count, last_used_at) VALUES (?, ?, ?, ?, 1, NOW())",
        [userId, apiKeyId, endpoint, currentMonth]
      );
    }
  } catch (error) {
    console.error("Error tracking usage:", error);
    // Don't fail the request if tracking fails
  }
}

/**
 * Generate PDF from HTML
 */
async function generatePdf(req, res) {
  let browser;

  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        message: "HTML content is required.",
      });
    }

    // Track usage
    await trackUsage(req.user.id, req.apiKey.id, "/api/pdf/generate");

    // Launch browser
    browser = await puppeteer.launch({
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      args: (
        process.env.PUPPETEER_ARGS || "--no-sandbox,--disable-setuid-sandbox"
      ).split(","),
      headless: "new",
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // PDF options
    const pdfOptions = {
      format: options.format || "A4",
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      ...options,
    };

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();

    // Log activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)",
      [
        req.user.id,
        "pdf_generated",
        JSON.stringify({ format: pdfOptions.format }),
      ]
    );

    // Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);

    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to generate PDF. Please check your HTML content and try again.",
    });
  }
}

/**
 * Generate PDF from URL
 */
async function generatePdfFromUrl(req, res) {
  let browser;

  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required.",
      });
    }

    // Track usage
    await trackUsage(req.user.id, req.apiKey.id, "/api/pdf/generate-from-url");

    // Launch browser
    browser = await puppeteer.launch({
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      args: (
        process.env.PUPPETEER_ARGS || "--no-sandbox,--disable-setuid-sandbox"
      ).split(","),
      headless: "new",
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Configure timeout from options or use default
    const timeout = options.timeout || 60000; // 60 seconds default

    // Navigate to URL with proper wait strategy
    await page.goto(url, {
      waitUntil: ["load", "domcontentloaded", "networkidle0"],
      timeout: timeout,
    });

    // Wait for images to load
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        selectors.map((img) => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve); // Resolve even on error to not block
            setTimeout(resolve, 5000); // Timeout after 5 seconds
          });
        })
      );
    });

    // Additional delay if specified in options (for dynamic content)
    if (options.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }

    // Wait for any lazy-loaded images or content
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === "complete") {
          resolve();
        } else {
          window.addEventListener("load", resolve);
          setTimeout(resolve, 3000); // Fallback timeout
        }
      });
    });

    // PDF options
    const pdfOptions = {
      format: options.format || "A4",
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      preferCSSPageSize: options.preferCSSPageSize || false,
      ...options,
    };

    // Remove options that shouldn't be passed to pdf()
    delete pdfOptions.timeout;
    delete pdfOptions.delay;

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();

    // Log activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)",
      [
        req.user.id,
        "pdf_generated_from_url",
        JSON.stringify({ url, format: pdfOptions.format }),
      ]
    );

    // Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);

    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to generate PDF from URL. Please check the URL and try again.",
    });
  }
}

module.exports = {
  generatePdf,
  generatePdfFromUrl,
};
