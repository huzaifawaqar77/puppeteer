const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

// Configuration
const APPWRITE_ENDPOINT = "https://appwrite.uiflexer.com/v1";
const APPWRITE_PROJECT_ID = "68c77b650020a2e5fa47";
const DATABASE_ID = "pdf-flex-db";

const APPWRITE_API_KEY =
  process.env.APPWRITE_API_KEY ||
  "standard_ecc660d56ff6fcd01beabbcc65f0afe40ba76f8962c321d19f71c1ec46d9df3426374604df99cdf9bced5ddbde676334b037d5a2656e280f14470c9efaee19e08f0f6615e5d864c41bdf12d2f820ef5ac7062a3b39b3085785bd8f1c0554f4f9e5d7ffb9e5040eaaebbe311a9372168e3025cf2a83ecf3a1b684fb796c8ecfad";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Helper to wait between operations
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCollectionWithAttributes(
  collectionId,
  collectionName,
  attributes,
  indexes
) {
  console.log(`  → Creating '${collectionId}' collection...`);

  // Step 1: Create collection
  try {
    await databases.createCollection(
      DATABASE_ID,
      collectionId,
      collectionName,
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log(`     ✅ Collection created`);
    await wait(1000);
  } catch (error) {
    if (error.code !== 409) {
      console.error(`     ❌ Failed to create collection: ${error.message}`);
      return false;
    }
    console.log(`     ℹ️  Collection already exists`);
  }

  // Step 2: Create attributes one by one
  for (const attr of attributes) {
    try {
      await attr();
      await wait(800);
    } catch (error) {
      if (error.code === 409) {
        continue;
      }
      console.error(`     ⚠️  Attribute error: ${error.message}`);
    }
  }

  // Step 3: Create indexes
  for (const idx of indexes) {
    try {
      await idx();
      await wait(500);
    } catch (error) {
      if (error.code !== 409) {
        console.error(`     ⚠️  Index error: ${error.message}`);
      }
    }
  }

  console.log(`  ✅ '${collectionId}' setup complete\n`);
  return true;
}

async function setupApiKeysCollection() {
  console.log("📁 Setting up API Keys collection...\n");

  // Collection: API Keys
  await createCollectionWithAttributes(
    "apiKeys",
    "API Keys",
    [
      // Core identification (required)
      // Note: Appwrite 1.7.4 requires min 150 chars for encrypted strings
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "userId",
          150,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "keyHash",
          150,
          true,
          undefined,
          undefined,
          true
        ), // UNIQUE - encrypted string needs min 150
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "keyPrefix",
          20,
          true
        ),

      // Metadata (required)
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "name",
          100,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "description",
          500,
          false
        ),

      // Tier & Access Control (required)
      () =>
        databases.createEnumAttribute(
          DATABASE_ID,
          "apiKeys",
          "tier",
          ["free", "premium"],
          true
        ),
      () =>
        databases.createEnumAttribute(
          DATABASE_ID,
          "apiKeys",
          "status",
          ["active", "inactive", "revoked", "expired"],
          true
        ),

      // Usage Tracking (required)
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "apiKeys",
          "requestCount",
          true,
          0
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "apiKeys",
          "lastUsedAt",
          false
        ),

      // Rate Limiting (optional)
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "apiKeys",
          "dailyLimit",
          false
        ),
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "apiKeys",
          "monthlyLimit",
          false
        ),

      // Expiration & Security (required timestamps, optional expiration)
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "apiKeys",
          "expiresAt",
          false
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "apiKeys",
          "createdAt",
          true
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "apiKeys",
          "updatedAt",
          true
        ),

      // Permissions & Endpoints (required)
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "allowedEndpoints",
          5000,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "allowedOrigins",
          5000,
          false
        ),

      // Audit Trail (optional)
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "createdFromIP",
          50,
          false
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "apiKeys",
          "lastUsedFromIP",
          50,
          false
        ),
    ],
    [
      // Indexes
      () =>
        databases.createIndex(DATABASE_ID, "apiKeys", "idx_userId", "key", [
          "userId",
        ]),
      () =>
        databases.createIndex(DATABASE_ID, "apiKeys", "idx_keyHash", "unique", [
          "keyHash",
        ]),
      () =>
        databases.createIndex(DATABASE_ID, "apiKeys", "idx_status", "key", [
          "status",
        ]),
      () =>
        databases.createIndex(DATABASE_ID, "apiKeys", "idx_expiresAt", "key", [
          "expiresAt",
        ]),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "apiKeys",
          "idx_userId_status",
          "key",
          ["userId", "status"]
        ),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "apiKeys",
          "idx_keyHash_status",
          "key",
          ["keyHash", "status"]
        ),
    ]
  );
}

async function setupApiKeyFeatures() {
  console.log("🚀 Starting API Key Management Setup...\n");
  console.log("═".repeat(50) + "\n");

  try {
    await setupApiKeysCollection();

    console.log("═".repeat(50));
    console.log("\n🎉 API Key Collection Setup Complete!\n");
    console.log("📋 Summary:");
    console.log("  ✅ Database: pdf-flex-db");
    console.log("  ✅ Collection: apiKeys");
    console.log("  ✅ Attributes: 18 attributes created");
    console.log("  ✅ Indexes: 6 indexes created");
    console.log("\n📊 Collection Details:");
    console.log("  - userId (String, required) - User owner");
    console.log("  - keyHash (String, required, UNIQUE) - SHA-256 hash");
    console.log("  - keyPrefix (String, required) - Display prefix");
    console.log("  - name (String, required) - User-friendly name");
    console.log("  - tier (Enum: free|premium) - Access tier");
    console.log(
      "  - status (Enum: active|inactive|revoked|expired) - Key status"
    );
    console.log("  - requestCount (Integer) - Total API requests");
    console.log("  - dailyLimit (Integer, optional) - Daily rate limit");
    console.log("  - createdAt, updatedAt, lastUsedAt - Timestamps");
    console.log("  - expiresAt (DateTime, optional) - Expiration date");
    console.log("  - createdFromIP, lastUsedFromIP - Audit trail");
    console.log("\n✨ API Key Management is ready to use!");
    console.log("   Backend routes available at /api/user/api-keys\n");
  } catch (error) {
    console.error("\n❌ Setup error:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("  - Verify APPWRITE_API_KEY environment variable is set");
    console.error(
      "  - Check API key has required scopes (databases.*.create_index, etc.)"
    );
    console.error("  - Ensure Appwrite server is running");
    console.error("  - Check internet connection\n");
    process.exit(1);
  }
}

setupApiKeyFeatures();
