const {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} = require("node-appwrite");

// Configuration
const APPWRITE_ENDPOINT = "https://appwrite.uiflexer.com/v1";
const APPWRITE_PROJECT_ID = "68c77b650020a2e5fa47";
const DATABASE_ID = "pdf-flex-db";
const DATABASE_NAME = "PDF Flex Database";

// Bucket Configuration
const INPUT_BUCKET_ID = "input-files";
const OUTPUT_BUCKET_ID = "output-files";

const APPWRITE_API_KEY =
  process.env.APPWRITE_API_KEY ||
  "standard_ecc660d56ff6fcd01beabbcc65f0afe40ba76f8962c321d19f71c1ec46d9df3426374604df99cdf9bced5ddbde676334b037d5a2656e280f14470c9efaee19e08f0f6615e5d864c41bdf12d2f820ef5ac7062a3b39b3085785bd8f1c0554f4f9e5d7ffb9e5040eaaebbe311a9372168e3025cf2a83ecf3a1b684fb796c8ecfad";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Helper to wait between operations (Appwrite needs time to process)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createDatabase() {
  console.log("🗄️  Creating database...");
  try {
    await databases.create(DATABASE_ID, DATABASE_NAME);
    console.log("✅ Database created\n");
    await wait(1000);
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️  Database already exists\n");
    } else {
      throw error;
    }
  }
}

async function createStorageBuckets() {
  console.log("📦 Creating storage buckets...");

  try {
    await storage.createBucket(
      INPUT_BUCKET_ID,
      "Input Files",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false,
      true,
      30000000,
      [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "odt",
        "ods",
        "odp",
        "rtf",
        "txt",
      ],
      "none",
      true,
      false
    );
    console.log("✅ Input bucket created");
  } catch (error) {
    if (error.code === 409) console.log("ℹ️  Input bucket already exists");
    else console.error("⚠️  Input bucket error:", error.message);
  }

  try {
    await storage.createBucket(
      OUTPUT_BUCKET_ID,
      "Output Files",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false,
      true,
      30000000,
      [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "zip",
        "txt",
        "json",
        "html",
        "csv",
        "xml",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "rtf",
      ],
      "none",
      true,
      false
    );
    console.log("✅ Output bucket created\n");
  } catch (error) {
    if (error.code === 409) console.log("ℹ️  Output bucket already exists\n");
    else console.error("⚠️  Output bucket error:", error.message);
  }
}

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
    console.log(`     Collection created`);
    await wait(1000); // Wait for collection to be ready
  } catch (error) {
    if (error.code !== 409) {
      console.error(`     ❌ Failed to create collection: ${error.message}`);
      return false;
    }
    console.log(`     Collection already exists`);
  }

  // Step 2: Create attributes one by one
  for (const attr of attributes) {
    try {
      await attr();
      await wait(800); // Critical: Wait between attribute creations
    } catch (error) {
      if (error.code === 409) {
        // Attribute already exists, continue
        continue;
      }
      console.error(`     ❌ Attribute error: ${error.message}`);
      // Continue to next attribute instead of failing completely
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

  console.log(`  ✅ '${collectionId}' setup complete`);
  return true;
}

async function setupCollections() {
  console.log("📁 Creating collections and attributes...\n");

  // Collection 1: Users
  await createCollectionWithAttributes(
    "users",
    "Users",
    [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "users",
          "userId",
          255,
          true
        ),
      () =>
        databases.createEnumAttribute(
          DATABASE_ID,
          "users",
          "planTier",
          ["FREE", "PRO", "ENTERPRISE"],
          true
        ),
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "users",
          "usageCount",
          false,
          0
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "users",
          "createdAt",
          true
        ),
    ],
    [
      () =>
        databases.createIndex(DATABASE_ID, "users", "userIdIndex", "key", [
          "userId",
        ]),
    ]
  );

  // Collection 2: Projects
  await createCollectionWithAttributes(
    "projects",
    "Projects",
    [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "projects",
          "ownerId",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "projects",
          "name",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "projects",
          "apiKey",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "projects",
          "whitelistedDomains",
          5000,
          false
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "projects",
          "createdAt",
          true
        ),
    ],
    [
      () =>
        databases.createIndex(DATABASE_ID, "projects", "ownerIdIndex", "key", [
          "ownerId",
        ]),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "projects",
          "apiKeyIndex",
          "unique",
          ["apiKey"]
        ),
    ]
  );

  // Collection 3: Files
  await createCollectionWithAttributes(
    "files",
    "Files",
    [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "files",
          "userId",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "files",
          "bucketFileId",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "files",
          "originalName",
          255,
          true
        ),
      () =>
        databases.createIntegerAttribute(DATABASE_ID, "files", "size", true),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "files",
          "mimeType",
          100,
          true
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "files",
          "uploadedAt",
          true
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "files",
          "expiresAt",
          false
        ),
    ],
    [
      () =>
        databases.createIndex(DATABASE_ID, "files", "userIdIndex", "key", [
          "userId",
        ]),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "files",
          "bucketFileIdIndex",
          "key",
          ["bucketFileId"]
        ),
    ]
  );

  // Collection 4: ProcessingJobs
  await createCollectionWithAttributes(
    "processingJobs",
    "Processing Jobs",
    [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "processingJobs",
          "userId",
          255,
          true
        ),
      () =>
        databases.createEnumAttribute(
          DATABASE_ID,
          "processingJobs",
          "operationType",
          ["MERGE", "SPLIT", "COMPRESS", "CONVERT", "OCR", "ROTATE"],
          true
        ),
      () =>
        databases.createEnumAttribute(
          DATABASE_ID,
          "processingJobs",
          "status",
          ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "processingJobs",
          "inputFileIds",
          5000,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "processingJobs",
          "outputFileId",
          255,
          false
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "processingJobs",
          "errorLog",
          2000,
          false
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "processingJobs",
          "startedAt",
          true
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "processingJobs",
          "completedAt",
          false
        ),
    ],
    [
      () =>
        databases.createIndex(
          DATABASE_ID,
          "processingJobs",
          "userIdIndex",
          "key",
          ["userId"]
        ),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "processingJobs",
          "statusIndex",
          "key",
          ["status"]
        ),
    ]
  );

  // Collection 5: ActivityLogs
  await createCollectionWithAttributes(
    "activityLogs",
    "Activity Logs",
    [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "activityLogs",
          "userId",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "activityLogs",
          "action",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "activityLogs",
          "ipAddress",
          50,
          false
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "activityLogs",
          "timestamp",
          true
        ),
    ],
    [
      () =>
        databases.createIndex(
          DATABASE_ID,
          "activityLogs",
          "userIdIndex",
          "key",
          ["userId"]
        ),
      () =>
        databases.createIndex(
          DATABASE_ID,
          "activityLogs",
          "timestampIndex",
          "key",
          ["timestamp"]
        ),
    ]
  );
}

async function setupAppwrite() {
  console.log("🚀 Starting Appwrite Complete Setup...\n");
  console.log("═".repeat(50) + "\n");

  try {
    await createDatabase();
    await createStorageBuckets();
    await setupCollections();

    console.log("\n" + "═".repeat(50));
    console.log("\n🎉 Setup completed!\n");
    console.log("📋 Summary:");
    console.log("  ✅ Database: pdf-flex-db");
    console.log("  ✅ Buckets: input-files, output-files (30MB max)");
    console.log(
      "  ✅ Collections: users, projects, files, processingJobs, activityLogs"
    );
    console.log("\n✨ Your Appwrite backend is ready!");
    console.log("   Visit http://localhost:3000\n");
  } catch (error) {
    console.error("\n❌ Setup error:", error.message);
    console.error("\n🔧 Check:");
    console.error("  - API key has required scopes");
    console.error("  - Internet connection is stable\n");
    process.exit(1);
  }
}

setupAppwrite();
