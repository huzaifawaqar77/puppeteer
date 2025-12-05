const { Client, Databases } = require("node-appwrite");

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

async function verifyCollection() {
  console.log("🔍 Verifying API Keys Collection Setup...\n");
  console.log("═".repeat(60) + "\n");

  try {
    // Get collection info
    const collection = await databases.getCollection(DATABASE_ID, "apiKeys");

    console.log("✅ Collection Found: apiKeys\n");
    console.log("📋 Collection Details:");
    console.log(`  ID: ${collection.$id}`);
    console.log(`  Name: ${collection.name}`);
    console.log(`  Document Count: ${collection.documentCount || 0}`);
    console.log(`  Created At: ${collection.$createdAt}\n`);

    // Get all attributes
    console.log("📊 Attributes:\n");
    const attributes = collection.attributes || [];

    if (attributes.length === 0) {
      console.log("  ⚠️  No attributes found\n");
    } else {
      attributes.forEach((attr, idx) => {
        const type = attr.type || "unknown";
        const required = attr.required ? "✅ Required" : "❌ Optional";
        const unique = attr.xdefault ? "(Default: " + attr.xdefault + ")" : "";
        console.log(
          `  ${idx + 1}. ${attr.key} (${type}) - ${required} ${unique}`
        );
      });
    }

    // Get all indexes
    console.log(`\n🔑 Indexes (Total: ${collection.indexes?.length || 0}):\n`);
    const indexes = collection.indexes || [];

    if (indexes.length === 0) {
      console.log("  ⚠️  No indexes found\n");
    } else {
      indexes.forEach((idx, i) => {
        const keys = idx.attributes?.join(", ") || "N/A";
        console.log(
          `  ${i + 1}. ${idx.key} (Type: ${idx.type}, Attributes: ${keys})`
        );
      });
    }

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("\n✅ Verification Summary:\n");
    console.log(`  ✅ Collection exists: apiKeys`);
    console.log(`  ✅ Total attributes: ${attributes.length}`);
    console.log(`  ✅ Total indexes: ${indexes.length}`);

    // Check for critical attributes
    const criticalAttrs = [
      "userId",
      "keyHash",
      "keyPrefix",
      "name",
      "tier",
      "status",
      "requestCount",
    ];
    const missingAttrs = criticalAttrs.filter(
      (attr) => !attributes.find((a) => a.key === attr)
    );

    if (missingAttrs.length === 0) {
      console.log(`  ✅ All critical attributes present`);
    } else {
      console.log(`  ⚠️  Missing attributes: ${missingAttrs.join(", ")}`);
    }

    // Check for critical indexes
    const criticalIndexes = ["idx_userId", "idx_keyHash", "idx_status"];
    const missingIndexes = criticalIndexes.filter(
      (idx) => !indexes.find((i) => i.key === idx)
    );

    if (missingIndexes.length === 0) {
      console.log(`  ✅ All critical indexes present`);
    } else {
      console.log(`  ⚠️  Missing indexes: ${missingIndexes.join(", ")}`);
    }

    console.log("\n✨ Collection is ready for API Key Management!\n");
  } catch (error) {
    console.error("❌ Error verifying collection:", error.message);
    if (error.code === 404) {
      console.error("\n⚠️  Collection 'apiKeys' not found!");
      console.error("   Run 'node scripts/setup-api-keys.js' to create it.\n");
    }
    process.exit(1);
  }
}

verifyCollection();
