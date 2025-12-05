const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

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

async function deleteCollection() {
  try {
    await databases.deleteCollection(DATABASE_ID, "blogs");
    console.log("✅ Blogs collection deleted");
  } catch (error) {
    console.error("❌ Error deleting collection:", error.message);
  }
}

deleteCollection();
