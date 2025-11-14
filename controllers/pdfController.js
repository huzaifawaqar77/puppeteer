const puppeteer = require("puppeteer-core");
const db = require("../config/database");

/**
 * Get quality settings based on subscription plan
 * @param {string} planSlug - The subscription plan slug (trial, starter, professional, business, superadmin)
 * @returns {object} Quality settings for PDF generation
 */
function getQualitySettings(planSlug) {
  const qualityMap = {
    trial: {
      scale: 0.8,
      preferCSSPageSize: false,
      quality: "standard",
      description: "Standard quality (80% scale)",
    },
    starter: {
      scale: 1.0,
      preferCSSPageSize: true,
      quality: "high",
      description: "High quality (100% scale)",
    },
    professional: {
      scale: 1.0,
      preferCSSPageSize: true,
      quality: "high",
      description: "High quality (100% scale)",
    },
    business: {
      scale: 1.2,
      preferCSSPageSize: true,
      quality: "premium",
      description: "Premium quality (120% scale)",
    },
    superadmin: {
      scale: 1.2,
      preferCSSPageSize: true,
      quality: "premium",
      description: "Premium quality (120% scale)",
    },
  };

  return qualityMap[planSlug] || qualityMap["trial"];
}

/**
 * Get user's branding settings and apply to PDF options
 * @param {number} userId - User ID
 * @param {string} planSlug - Subscription plan slug
 * @param {object} options - Current PDF options
 * @returns {object} Updated PDF options with branding applied
 */
async function applyBranding(userId, planSlug, options) {
  // Only Business and SuperAdmin plans can use custom branding
  if (!["business", "superadmin"].includes(planSlug)) {
    console.log("applyBranding: Plan not eligible for branding:", planSlug);
    return options;
  }

  try {
    // Get user's branding settings
    const [users] = await db.execute(
      "SELECT branding_settings FROM users WHERE id = ?",
      [userId]
    );

    console.log("applyBranding: User query result:", users[0]);

    if (!users[0] || !users[0].branding_settings) {
      console.log("applyBranding: No branding settings found");
      return options;
    }

    // MySQL automatically parses JSON columns, so check if it's already an object
    let branding = users[0].branding_settings;
    if (typeof branding === "string") {
      branding = JSON.parse(branding);
    }
    console.log("applyBranding: Parsed branding:", branding);

    // If user has custom branding, apply it to headers/footers
    if (branding && branding.company_name) {
      // Build branded header template
      let headerTemplate =
        '<div style="width: 100%; text-align: center; padding: 10px; font-size: 10px;">';

      if (branding.logo_url) {
        headerTemplate += `<img src="${branding.logo_url}" height="30px" style="margin-bottom: 5px;" />`;
      }

      headerTemplate += `<div style="color: ${
        branding.primary_color || "#667eea"
      }; font-weight: bold;">${branding.company_name}</div>`;
      headerTemplate += "</div>";

      // Build branded footer template
      const footerTemplate = `
        <div style="width: 100%; text-align: center; padding: 10px; font-size: 9px; color: #666;">
          <div>© ${new Date().getFullYear()} ${branding.company_name}</div>
          <div style="margin-top: 3px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `;

      // Apply branding to options (only if user hasn't provided custom templates)
      return {
        ...options,
        displayHeaderFooter: true,
        headerTemplate: options.headerTemplate || headerTemplate,
        footerTemplate: options.footerTemplate || footerTemplate,
        margin: options.margin || {
          top: "80px",
          bottom: "80px",
          left: "20px",
          right: "20px",
        },
      };
    }

    return options;
  } catch (error) {
    console.error("Error applying branding:", error);
    return options; // Return original options if branding fails
  }
}

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

    // Check if user is trying to use custom headers/footers
    if (
      (options.displayHeaderFooter ||
        options.headerTemplate ||
        options.footerTemplate) &&
      !["professional", "business", "superadmin"].includes(
        req.subscription.plan_slug
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Custom headers and footers are only available on Professional and Business plans. Please upgrade your plan to access this feature.",
        requiresUpgrade: true,
        availablePlans: ["professional", "business"],
        currentPlan: req.subscription.plan_slug,
      });
    }

    // Get quality settings based on user's subscription plan
    const qualitySettings = getQualitySettings(req.subscription.plan_slug);

    // Apply branding for Business plan users
    const brandedOptions = await applyBranding(
      req.user.id,
      req.subscription.plan_slug,
      options
    );

    // Debug logging
    console.log("=== BRANDING DEBUG ===");
    console.log("User ID:", req.user.id);
    console.log("Plan:", req.subscription.plan_slug);
    console.log("Original options:", options);
    console.log("Branded options:", brandedOptions);
    console.log("Has displayHeaderFooter:", brandedOptions.displayHeaderFooter);
    console.log("Has headerTemplate:", !!brandedOptions.headerTemplate);
    console.log("Has footerTemplate:", !!brandedOptions.footerTemplate);

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

    // PDF options with quality settings and branding applied
    const pdfOptions = {
      format: brandedOptions.format || "A4",
      printBackground: brandedOptions.printBackground !== false,
      scale: qualitySettings.scale, // Apply plan-based quality
      preferCSSPageSize: qualitySettings.preferCSSPageSize, // Apply plan-based setting
      margin: brandedOptions.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      ...brandedOptions,
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
        JSON.stringify({
          format: pdfOptions.format,
          quality: qualitySettings.quality,
          scale: qualitySettings.scale,
          plan: req.subscription.plan_slug,
        }),
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

    // Check if user is trying to use custom headers/footers
    if (
      (options.displayHeaderFooter ||
        options.headerTemplate ||
        options.footerTemplate) &&
      !["professional", "business", "superadmin"].includes(
        req.subscription.plan_slug
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Custom headers and footers are only available on Professional and Business plans. Please upgrade your plan to access this feature.",
        requiresUpgrade: true,
        availablePlans: ["professional", "business"],
        currentPlan: req.subscription.plan_slug,
      });
    }

    // Get quality settings based on user's subscription plan
    const qualitySettings = getQualitySettings(req.subscription.plan_slug);

    // Apply branding for Business plan users
    const brandedOptions = await applyBranding(
      req.user.id,
      req.subscription.plan_slug,
      options
    );

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

    // PDF options with quality settings and branding applied
    const pdfOptions = {
      format: brandedOptions.format || "A4",
      printBackground: brandedOptions.printBackground !== false,
      scale: qualitySettings.scale, // Apply plan-based quality
      preferCSSPageSize: qualitySettings.preferCSSPageSize, // Apply plan-based setting
      margin: brandedOptions.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      ...brandedOptions,
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
        JSON.stringify({
          url,
          format: pdfOptions.format,
          quality: qualitySettings.quality,
          scale: qualitySettings.scale,
          plan: req.subscription.plan_slug,
        }),
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
