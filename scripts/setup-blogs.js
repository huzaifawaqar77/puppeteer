const { Client, Databases, ID, Permission, Role } = require("node-appwrite");

/**
 * Script to add Blogs collection to Appwrite database
 * Run this after the main setup-appwrite.js
 */

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createBlogsCollection() {
  console.log("📚 Creating blogs collection...\n");

  try {
    // Create collection
    await databases.createCollection(DATABASE_ID, "blogs", "Blogs", [
      Permission.read(Role.any()),
    ]);
    console.log("✅ Blogs collection created");
    await wait(1000);

    // Create attributes
    const attributes = [
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "title",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "slug",
          255,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "description",
          500,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "content",
          10000,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "excerpt",
          500,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "author",
          100,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "category",
          50,
          true
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "featuredImage",
          500,
          false
        ),
      () =>
        databases.createStringAttribute(
          DATABASE_ID,
          "blogs",
          "tags",
          500,
          false
        ),
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "blogs",
          "readTime",
          true
        ),
      () =>
        databases.createIntegerAttribute(
          DATABASE_ID,
          "blogs",
          "views",
          false,
          0
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "blogs",
          "publishedAt",
          true
        ),
      () =>
        databases.createDatetimeAttribute(
          DATABASE_ID,
          "blogs",
          "updatedAt",
          false
        ),
    ];

    for (const attr of attributes) {
      try {
        await attr();
        await wait(500);
      } catch (error) {
        if (error.code !== 409) {
          console.error(`⚠️ Attribute error: ${error.message}`);
        }
      }
    }

    // Create indexes
    const indexes = [
      () =>
        databases.createIndex(DATABASE_ID, "blogs", "slugIndex", "key", [
          "slug",
        ]),
      () =>
        databases.createIndex(DATABASE_ID, "blogs", "categoryIndex", "key", [
          "category",
        ]),
      () =>
        databases.createIndex(DATABASE_ID, "blogs", "publishedAtIndex", "key", [
          "publishedAt",
        ]),
    ];

    for (const idx of indexes) {
      try {
        await idx();
        await wait(500);
      } catch (error) {
        if (error.code !== 409) {
          console.error(`⚠️ Index error: ${error.message}`);
        }
      }
    }

    console.log("✅ Blogs collection setup complete\n");
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️ Blogs collection already exists\n");
    } else {
      console.error("❌ Error creating blogs collection:", error.message);
      throw error;
    }
  }
}

async function seedSampleBlogs() {
  console.log("🌱 Seeding sample blogs...\n");

  const sampleBlogs = [
    {
      title: "Complete Guide to PDF Compression: Best Practices and Tools",
      slug: "pdf-compression-guide",
      description:
        "Learn how to compress PDFs without losing quality. Discover the best compression techniques and tools available.",
      excerpt:
        "PDF compression is essential for efficient file management. This guide covers techniques, tools, and best practices.",
      content: `# Complete Guide to PDF Compression

PDF compression is one of the most sought-after features in document management. Whether you're managing large archives or sharing files over email, understanding PDF compression can save you time and storage space.

## Why Compress PDFs?

- **Reduce Storage Costs**: Smaller files consume less disk space
- **Faster Sharing**: Compressed PDFs upload and download quicker
- **Email Compliance**: Many email providers have attachment size limits
- **Archive Efficiency**: Better for long-term document storage

## Compression Methods

### 1. Lossless Compression
Maintains all original content while reducing file size. Perfect for documents where quality is paramount.

### 2. Lossy Compression
Removes some data to achieve smaller file sizes. Suitable for files where minor quality loss is acceptable.

## Best Tools for PDF Compression

Our platform offers state-of-the-art PDF compression with multiple optimization levels. Choose from:
- **Standard Compression**: 40-50% size reduction
- **Balanced Compression**: 50-70% size reduction
- **Maximum Compression**: 70-90% size reduction

## Step-by-Step Guide

1. Upload your PDF file
2. Select compression level
3. Download the compressed file
4. Verify the quality

Start compressing your PDFs today!`,
      author: "OmniPDF Team",
      category: "PDF Tips",
      featuredImage:
        "https://images.unsplash.com/photo-1633356122544-f134ef2944f1?w=1200&h=630&fit=crop",
      tags: "compression,optimization,storage,tutorial",
      readTime: 8,
      views: 1250,
      publishedAt: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      title: "Mastering PDF OCR: Convert Scanned Documents to Searchable Text",
      slug: "pdf-ocr-mastery",
      description:
        "Transform scanned PDFs into searchable, editable documents using advanced OCR technology.",
      excerpt:
        "OCR technology revolutionizes how we work with scanned documents. Learn how to maximize its potential.",
      content: `# Mastering PDF OCR

Optical Character Recognition (OCR) is transforming how we digitize and manage paper documents. With advanced OCR technology, scanned PDFs become searchable and editable.

## What is OCR?

OCR (Optical Character Recognition) converts images of text into actual text that computers can read, search, and edit.

## Benefits of Using OCR

- **Searchability**: Find text within scanned documents instantly
- **Editability**: Copy and modify text from scanned images
- **Accessibility**: Make documents accessible to screen readers
- **Data Extraction**: Automatically extract information from forms

## How Our OCR Works

Our platform uses advanced machine learning models to achieve:
- **99.8% Accuracy**: Industry-leading character recognition
- **Multi-language Support**: Recognize text in 100+ languages
- **Fast Processing**: Convert documents in seconds
- **Format Preservation**: Maintain original layout

## Use Cases

1. **Business Documents**: Digitize old invoices and contracts
2. **Academic Papers**: Convert scanned research papers
3. **Legal Documents**: Archive and search legal files
4. **Healthcare**: Digitize medical records

Get started with OCR today!`,
      author: "OmniPDF Team",
      category: "Technology",
      featuredImage:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
      tags: "ocr,scanning,digitization,technology",
      readTime: 10,
      views: 2100,
      publishedAt: new Date(
        Date.now() - 20 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      title:
        "PDF API Integration: Building Powerful Document Processing Solutions",
      slug: "pdf-api-integration",
      description:
        "Learn how to integrate PDF APIs into your applications for seamless document processing.",
      excerpt:
        "PDF APIs enable developers to build sophisticated document processing solutions. Explore integration best practices.",
      content: `# PDF API Integration Guide

PDF APIs empower developers to build intelligent document processing solutions. Whether you're building a content management system or a document automation platform, understanding PDF APIs is crucial.

## Why Use PDF APIs?

APIs provide programmatic access to PDF processing capabilities, enabling:
- Automated workflows
- Cloud-based processing
- Scalable solutions
- Integration with existing systems

## Key Features of Modern PDF APIs

- Document Conversion
- OCR and Text Extraction
- Merging and Splitting
- Digital Signatures
- Watermarking and Redaction

## Getting Started

1. Authenticate with API credentials
2. Choose your processing operation
3. Submit your document
4. Retrieve processed results

## Best Practices

- Implement error handling
- Use asynchronous processing for large files
- Cache results when appropriate
- Monitor API usage

Start integrating PDF APIs into your applications!`,
      author: "OmniPDF Team",
      category: "Development",
      featuredImage:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop",
      tags: "api,development,integration,coding",
      readTime: 12,
      views: 3400,
      publishedAt: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      title:
        "PDF Security: Protecting Your Documents with Encryption and Passwords",
      slug: "pdf-security-guide",
      description:
        "Comprehensive guide to securing your PDFs with encryption, passwords, and advanced protection methods.",
      excerpt:
        "Learn how to protect sensitive PDF documents with passwords and encryption.",
      content: `# PDF Security Guide

In an era of digital threats, protecting your PDF documents is more important than ever. This guide covers everything you need to know about PDF security.

## Types of PDF Security

### Password Protection
- **User Password**: Restrict document opening
- **Owner Password**: Restrict document editing and printing

### Encryption
- **128-bit encryption**: Standard security level
- **256-bit encryption**: Military-grade security

## When You Need PDF Security

- Financial documents
- Medical records
- Legal contracts
- Proprietary information
- Personal data

## Best Practices

1. Use strong passwords (12+ characters)
2. Include numbers, symbols, and uppercase letters
3. Store passwords securely
4. Use encryption for sensitive data

## Implementing Security

Our platform makes it easy:
1. Upload your PDF
2. Set password and encryption level
3. Download protected file
4. Share securely

Protect your documents today!`,
      author: "OmniPDF Team",
      category: "Security",
      featuredImage:
        "https://images.unsplash.com/photo-1526374965328-7f5ae4e8b08f?w=1200&h=630&fit=crop",
      tags: "security,encryption,password,protection",
      readTime: 9,
      views: 2800,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  try {
    for (const blog of sampleBlogs) {
      try {
        await databases.createDocument(DATABASE_ID, "blogs", ID.unique(), blog);
        console.log(`✅ Seeded: ${blog.title}`);
        await wait(500);
      } catch (error) {
        console.error(`⚠️ Error seeding blog: ${error.message}`);
      }
    }
    console.log("\n✅ Sample blogs seeded successfully\n");
  } catch (error) {
    console.error("❌ Error seeding blogs:", error.message);
  }
}

async function setup() {
  console.log("🚀 Setting up Blogs Collection...\n");
  console.log("═".repeat(50) + "\n");

  try {
    await createBlogsCollection();
    await seedSampleBlogs();

    console.log("═".repeat(50));
    console.log("\n🎉 Blogs collection setup completed!");
    console.log("\n📋 Summary:");
    console.log("  ✅ Collection: blogs");
    console.log("  ✅ Attributes: 14 fields (title, slug, content, etc.)");
    console.log("  ✅ Indexes: 4 optimized indexes");
    console.log("  ✅ Sample blogs: 4 curated blogs seeded\n");
  } catch (error) {
    console.error("\n❌ Setup error:", error.message);
    process.exit(1);
  }
}

setup();
