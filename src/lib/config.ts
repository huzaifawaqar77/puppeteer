export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    "https://appwrite.uiflexer.com/v1",
  projectId:
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68c77b650020a2e5fa47",
  databaseId: process.env.NEXT_PUBLIC_DATABASE_ID || "pdf-flex-db",

  // Collections
  collections: {
    users: "users",
    projects: "projects",
    files: "files",
    processingJobs: "processingJobs",
    activityLogs: "activityLogs",
    apiKeys: "apiKeys",
  },

  // Storage Buckets
  buckets: {
    input: process.env.NEXT_PUBLIC_INPUT_BUCKET_ID || "input-files",
    output: process.env.NEXT_PUBLIC_OUTPUT_BUCKET_ID || "output-files",
  },
};

// Stirling PDF Configuration
export const stirlingConfig = {
  url: process.env.STIRLING_PDF_URL || "http://localhost:8080",
  apiKey:
    process.env.STIRLING_PDF_API_KEY || "75e0b668-27be-423c-8016-5b1ccd1c19d9",
};

// Gotenberg Configuration
export const gotenbergConfig = {
  url: process.env.GOTENBERG_URL || "https://gotenberg.uiflexer.com",
  username: process.env.GOTENBERG_USERNAME || "",
  password: process.env.GOTENBERG_PASSWORD || "",
};
