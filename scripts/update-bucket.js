const { Client, Storage } = require("node-appwrite");

const APPWRITE_ENDPOINT = "https://appwrite.uiflexer.com/v1";
const APPWRITE_PROJECT_ID = "68c77b050020a2e5fa47";
const INPUT_BUCKET_ID = "input-files";
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || "standard_ecc660d56ff6fcd01beabbcc65f0afe40ba76f8962c321d19f71c1ec46d9df3426374604df99cdf9bced5ddbde676334b037d5a2656e280f14470c9efaee19e08f0f6615e5d864c41bdf12d2f820ef5ac7062a3b39b3085785bd8f1c0554f4f9e5d7ffb9e5040eaaebbe311a9372168e3025cf2a83ecf3a1b684fb796c8ecfad";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const storage = new Storage(client);

async function updateBucket() {
  try {
    console.log("🔄 Updating input-files bucket...");
    
    // Update bucket with new file extensions
    await storage.updateBucket(
      INPUT_BUCKET_ID,
      "Input Files",
      undefined, // permissions (keep existing)
      undefined, // fileSecurity 
      true, // enabled
      30000000, // max file size (30MB)
      ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf", "txt"], // allowed extensions
      undefined, // compression
      true, // encryption
      false // antivirus
    );
    
    console.log("✅ Bucket updated successfully!");
    console.log("📄 Allowed extensions: pdf, jpg, jpeg, png, doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp, rtf, txt");
  } catch (error) {
    console.error("❌ Error updating bucket:", error.message);
  }
}

updateBucket();
