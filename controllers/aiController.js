const db = require("../config/database");

/**
 * Check if user has AI access based on their subscription plan
 */
async function hasAIAccess(userId) {
  try {
    const [rows] = await db.execute(
      `
            SELECT sp.features, sp.slug
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = ? AND us.status IN ('trial', 'active')
            ORDER BY us.created_at DESC
            LIMIT 1
        `,
      [userId]
    );

    if (rows.length === 0) {
      return false;
    }

    const plan = rows[0];

    // SuperAdmin always has access
    if (plan.slug === "superadmin") {
      return true;
    }

    // Parse features safely
    let features = [];
    try {
      // Handle both JSON string and already parsed array
      if (typeof plan.features === "string") {
        features = JSON.parse(plan.features);
      } else if (Array.isArray(plan.features)) {
        features = plan.features;
      }
    } catch (parseError) {
      console.error("Error parsing features JSON:", parseError);
      console.error("Features value:", plan.features);
      return false;
    }

    // Check if plan includes AI Template Generator
    return features.some(
      (feature) =>
        typeof feature === "string" &&
        feature.toLowerCase().includes("ai template")
    );
  } catch (error) {
    console.error("Error checking AI access:", error);
    return false;
  }
}

/**
 * Generate HTML template using Google Gemini AI
 */
async function generateTemplate(req, res) {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Template description is required.",
      });
    }

    // Check if user has AI access
    const hasAccess = await hasAIAccess(req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "AI Template Generator is only available on Professional, Business, and SuperAdmin plans. Please upgrade your plan to access this feature.",
        requiresUpgrade: true,
        availablePlans: ["professional", "business"],
      });
    }

    // Check if Gemini API key is configured
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "your-gemini-api-key-here"
    ) {
      return res.status(503).json({
        success: false,
        message: "AI service is not configured. Please contact support.",
      });
    }

    // Use direct API call instead of SDK for better compatibility
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    const apiKey = process.env.GEMINI_API_KEY;

    // Create prompt for HTML generation
    const prompt = `You are an expert HTML/CSS developer. Generate a complete, professional HTML template based on the following description. The HTML should be production-ready, well-structured, and include inline CSS for styling.

Description: ${description}

Requirements:
1. Generate ONLY the HTML code, no explanations
2. Include complete HTML structure with <!DOCTYPE html>, <html>, <head>, and <body> tags
3. Use inline CSS or <style> tags for all styling
4. Make it responsive and professional-looking
5. Include proper semantic HTML5 tags
6. Ensure the design is print-friendly for PDF generation
7. Use modern, clean design principles
8. Include appropriate fonts, colors, and spacing

Generate the HTML template now:`;

    // Make direct API call to Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 2048,
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${apiResponse.status} ${
          apiResponse.statusText
        } - ${JSON.stringify(errorData)}`
      );
    }

    const data = await apiResponse.json();

    // Extract text from response
    let htmlContent = "";
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      htmlContent = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }

    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Log activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action, metadata) VALUES (?, ?, ?)",
      [
        req.user.id,
        "ai_template_generated",
        JSON.stringify({
          description: description.substring(0, 100),
          templateLength: htmlContent.length,
        }),
      ]
    );

    res.json({
      success: true,
      html: htmlContent,
      message: "Template generated successfully!",
    });
  } catch (error) {
    console.error("AI template generation error:", error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes("API key")) {
      return res.status(503).json({
        success: false,
        message: "AI service configuration error. Please contact support.",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to generate template. Please try again or simplify your description.",
    });
  }
}

module.exports = {
  generateTemplate,
  hasAIAccess,
};
