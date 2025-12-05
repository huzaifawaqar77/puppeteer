import fs from "fs";
import path from "path";

type ToolSpec = {
  routeDir: string;
  expectedKeys: string[];
};

const projectRoot = path.resolve(__dirname, "..", "src", "app", "api");

const specs: ToolSpec[] = [
  { routeDir: "markdown-to-pdf", expectedKeys: ["fileInput"] },
  { routeDir: "url-to-pdf", expectedKeys: ["urlInput"] },
  { routeDir: "pdf-to-markdown", expectedKeys: ["fileInput"] },
  { routeDir: "pdf-to-xml", expectedKeys: ["fileInput"] },
  { routeDir: "remove-pages", expectedKeys: ["fileInput", "pages"] },
  { routeDir: "multi-page-layout", expectedKeys: ["fileInput", "nUp"] },
  { routeDir: "auto-split", expectedKeys: ["fileInput"] },
  { routeDir: "add-image", expectedKeys: ["fileInput", "imageFile", "x", "y"] },
  {
    routeDir: "add-stamp",
    expectedKeys: [
      "fileInput",
      "stampType",
      "pageNumbers",
      "position",
      "rotation",
      "opacity",
    ],
  },
  {
    routeDir: "scanner-effect",
    expectedKeys: ["fileInput", "quality", "noise", "blur", "rotation"],
  },
  {
    routeDir: "contrast",
    expectedKeys: ["fileInput", "contrast", "brightness", "saturation"],
  },
  { routeDir: "metadata", expectedKeys: ["fileInput"] },
  { routeDir: "get-info", expectedKeys: ["fileInput"] },
  { routeDir: "detect-blank-pages", expectedKeys: ["fileInput"] },
  { routeDir: "show-javascript", expectedKeys: ["fileInput"] },
  { routeDir: "compare", expectedKeys: ["file1", "file2"] },
  {
    routeDir: "sign",
    expectedKeys: ["fileInput", "privateKeyFile", "password"],
  },
  { routeDir: "linearize", expectedKeys: ["fileInput"] },
  {
    routeDir: "convert",
    expectedKeys: [
      "fileInput",
      "imageFormat",
      "singleOrMultiple",
      "colorType",
      "dpi",
    ],
  },
];

function extractFormKeys(fileContent: string): string[] {
  const regex = /formData\.append\(\s*"([^"]+)"/g;
  const keys: string[] = [];
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

let hasError = false;

for (const spec of specs) {
  const filePath = path.join(projectRoot, spec.routeDir, "route.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  const keys = extractFormKeys(content);
  const missing = spec.expectedKeys.filter((k) => !keys.includes(k));
  const extras = keys.filter((k) => !spec.expectedKeys.includes(k));
  if (missing.length || extras.length) {
    hasError = true;
    console.log(`[${spec.routeDir}] MISMATCH`);
    if (missing.length) console.log(`  Missing: ${missing.join(", ")}`);
    if (extras.length) console.log(`  Extra: ${extras.join(", ")}`);
  } else {
    console.log(`[${spec.routeDir}] OK`);
  }
}

process.exit(hasError ? 1 : 0);
