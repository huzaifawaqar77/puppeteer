require("dotenv").config();
const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pdf_saas",
  port: process.env.DB_PORT || 3306,
};

async function fixFeatures() {
  let connection;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected successfully!");

    // Get all plans
    const [plans] = await connection.execute(
      "SELECT id, slug, features FROM subscription_plans"
    );

    console.log("\nChecking subscription plans...");

    for (const plan of plans) {
      console.log(`\nPlan: ${plan.slug}`);
      console.log(`Current features: ${plan.features}`);

      // Try to parse features
      let isValid = true;
      try {
        JSON.parse(plan.features);
        console.log("✓ Features are valid JSON");
      } catch (error) {
        console.log("✗ Features are NOT valid JSON");
        isValid = false;
      }

      // If not valid, fix it based on plan
      if (!isValid) {
        let newFeatures;
        switch (plan.slug) {
          case "trial":
            newFeatures = JSON.stringify([
              "10 PDF conversions per month",
              "Basic support",
              "Standard quality",
            ]);
            break;
          case "starter":
            newFeatures = JSON.stringify([
              "100 PDF conversions per month",
              "Email support",
              "High quality output",
              "API access",
            ]);
            break;
          case "professional":
            newFeatures = JSON.stringify([
              "1,000 PDF conversions per month",
              "Priority support",
              "High quality output",
              "API access",
              "Custom headers/footers",
              "AI Template Generator",
            ]);
            break;
          case "business":
            newFeatures = JSON.stringify([
              "10,000 PDF conversions per month",
              "Priority support",
              "Premium quality",
              "API access",
              "Custom branding",
              "SLA guarantee",
              "AI Template Generator",
              "Priority AI access",
            ]);
            break;
          case "superadmin":
            newFeatures = JSON.stringify([
              "Unlimited PDF conversions",
              "Full admin access",
              "All features included",
              "AI Template Generator",
            ]);
            break;
          default:
            console.log(`Unknown plan slug: ${plan.slug}, skipping...`);
            continue;
        }

        console.log(`Updating to: ${newFeatures}`);
        await connection.execute(
          "UPDATE subscription_plans SET features = ? WHERE id = ?",
          [newFeatures, plan.id]
        );
        console.log("✓ Updated successfully");
      }
    }

    console.log("\n✅ All plans checked and fixed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\nDatabase connection closed.");
    }
  }
}

// Run the fix
fixFeatures();

