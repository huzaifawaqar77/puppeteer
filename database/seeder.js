require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pdf_saas",
  port: process.env.DB_PORT || 3306,
};

// Generate API key
function generateApiKey() {
  return "sk_" + crypto.randomBytes(32).toString("hex");
}

async function seedDatabase() {
  let connection;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected successfully!");

    // Clear existing data (in reverse order of dependencies)
    console.log("\nClearing existing data...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE payment_transactions");
    await connection.execute("TRUNCATE TABLE activity_logs");
    await connection.execute("TRUNCATE TABLE api_usage");
    await connection.execute("TRUNCATE TABLE api_keys");
    await connection.execute("TRUNCATE TABLE user_subscriptions");
    await connection.execute("TRUNCATE TABLE subscription_plans");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Existing data cleared!");

    // Seed subscription plans
    console.log("\nSeeding subscription plans...");
    const plans = [
      {
        name: "Trial",
        slug: "trial",
        description: "Free trial plan with limited conversions",
        monthly_conversions: 10,
        price: 0.0,
        features: JSON.stringify([
          "10 PDF conversions per month",
          "Basic support",
          "Standard quality",
        ]),
      },
      {
        name: "Starter",
        slug: "starter",
        description: "Perfect for individuals and small projects",
        monthly_conversions: 100,
        price: 9.99,
        features: JSON.stringify([
          "100 PDF conversions per month",
          "Email support",
          "High quality output",
          "API access",
        ]),
      },
      {
        name: "Professional",
        slug: "professional",
        description: "Ideal for growing businesses",
        monthly_conversions: 1000,
        price: 29.99,
        features: JSON.stringify([
          "1,000 PDF conversions per month",
          "Priority support",
          "High quality output",
          "API access",
          "Custom headers/footers",
          "AI Template Generator",
        ]),
      },
      {
        name: "Business",
        slug: "business",
        description: "For high-volume users",
        monthly_conversions: 10000,
        price: 99.99,
        features: JSON.stringify([
          "10,000 PDF conversions per month",
          "Priority support",
          "Premium quality",
          "API access",
          "Custom branding",
          "SLA guarantee",
          "AI Template Generator",
          "Priority AI access",
        ]),
      },
      {
        name: "SuperAdmin",
        slug: "superadmin",
        description: "Unlimited access for administrators",
        monthly_conversions: -1, // -1 means unlimited
        price: 0.0,
        features: JSON.stringify([
          "Unlimited PDF conversions",
          "Full admin access",
          "All features included",
          "AI Template Generator",
        ]),
      },
    ];

    for (const plan of plans) {
      await connection.execute(
        "INSERT INTO subscription_plans (name, slug, description, monthly_conversions, price, features) VALUES (?, ?, ?, ?, ?, ?)",
        [
          plan.name,
          plan.slug,
          plan.description,
          plan.monthly_conversions,
          plan.price,
          plan.features,
        ]
      );
    }
    console.log(`✓ Seeded ${plans.length} subscription plans`);

    // Seed superadmin user
    console.log("\nSeeding superadmin user...");
    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);
    const [userResult] = await connection.execute(
      "INSERT INTO users (email, password, full_name, is_verified, role) VALUES (?, ?, ?, ?, ?)",
      [
        "admin@uiflexer.com",
        hashedPassword,
        "Super Administrator",
        true,
        "superadmin",
      ]
    );
    const superadminId = userResult.insertId;
    console.log("✓ Superadmin user created");
    console.log("  Email: admin@uiflexer.com");
    console.log("  Password: SuperAdmin@123");
    console.log("  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");

    // Get superadmin plan ID
    const [planRows] = await connection.execute(
      "SELECT id FROM subscription_plans WHERE slug = ?",
      ["superadmin"]
    );
    const superadminPlanId = planRows[0].id;

    // Create subscription for superadmin
    const now = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10); // 10 years from now

    await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, payment_status, last_payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [superadminId, superadminPlanId, "active", now, futureDate, "paid", now]
    );
    console.log("✓ Superadmin subscription created");

    // Create API key for superadmin
    const superadminApiKey = generateApiKey();
    await connection.execute(
      "INSERT INTO api_keys (user_id, api_key, name, is_active) VALUES (?, ?, ?, ?)",
      [superadminId, superadminApiKey, "SuperAdmin API Key", true]
    );
    console.log("✓ Superadmin API key created");
    console.log(`  API Key: ${superadminApiKey}`);
    console.log("  ⚠️  SAVE THIS API KEY - IT WON'T BE SHOWN AGAIN!");

    // Seed demo trial user
    console.log("\nSeeding demo trial user...");
    const demoPassword = await bcrypt.hash("Demo@123", 10);
    const [demoUserResult] = await connection.execute(
      "INSERT INTO users (email, password, full_name, is_verified, role) VALUES (?, ?, ?, ?, ?)",
      ["demo@example.com", demoPassword, "Demo User", true, "user"]
    );
    const demoUserId = demoUserResult.insertId;

    // Get trial plan ID
    const [trialPlanRows] = await connection.execute(
      "SELECT id FROM subscription_plans WHERE slug = ?",
      ["trial"]
    );
    const trialPlanId = trialPlanRows[0].id;

    // Create trial subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 days trial

    await connection.execute(
      "INSERT INTO user_subscriptions (user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [demoUserId, trialPlanId, "trial", trialEnd, now, trialEnd, "pending"]
    );

    // Create API key for demo user
    const demoApiKey = generateApiKey();
    await connection.execute(
      "INSERT INTO api_keys (user_id, api_key, name, is_active) VALUES (?, ?, ?, ?)",
      [demoUserId, demoApiKey, "Demo API Key", true]
    );
    console.log("✓ Demo user created");
    console.log("  Email: demo@example.com");
    console.log("  Password: Demo@123");
    console.log(`  API Key: ${demoApiKey}`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Summary:");
    console.log("  - 5 subscription plans created");
    console.log("  - 1 superadmin user created");
    console.log("  - 1 demo trial user created");
    console.log(
      "\n⚠️  IMPORTANT: Save the API keys and change default passwords in production!"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\nDatabase connection closed.");
    }
  }
}

// Run seeder
seedDatabase();
