const { Client, Databases } = require("node-appwrite");

const APPWRITE_API_KEY =
  process.env.APPWRITE_API_KEY ||
  "standard_ecc660d56ff6fcd01beabbcc65f0afe40ba76f8962c321d19f71c1ec46d9df3426374604df99cdf9bced5ddbde676334b037d5a2656e280f14470c9efaee19e08f0f6615e5d864c41bdf12d2f820ef5ac7062a3b39b3085785bd8f1c0554f4f9e5d7ffb9e5040eaaebbe311a9372168e3025cf2a83ecf3a1b684fb796c8ecfad";

const client = new Client()
  .setEndpoint("https://appwrite.uiflexer.com/v1")
  .setProject("68c77b650020a2e5fa47")
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

(async () => {
  try {
    const collection = await databases.getCollection("pdf-flex-db", "apiKeys");
    const keyHashAttr = collection.attributes.find((a) => a.key === "keyHash");
    console.log("✅ keyHash attribute found:");
    console.log(JSON.stringify(keyHashAttr, null, 2));

    console.log("\n📊 Attribute Details:");
    console.log(`  Type: ${keyHashAttr.type}`);
    console.log(`  Size: ${keyHashAttr.size}`);
    console.log(`  Required: ${keyHashAttr.required}`);
    console.log(`  Encrypted: ${keyHashAttr.encrypted}`);
    console.log(`  Array: ${keyHashAttr.array}`);
  } catch (e) {
    console.error("❌ Error:", e.message);
    if (e.response) console.error("Response:", e.response);
    process.exit(1);
  }
})();
