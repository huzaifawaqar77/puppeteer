# Appwrite Setup Instructions

## Step 1: Create Database and Buckets in Appwrite Console

Before running the setup script, manually create the following in your Appwrite console:

### Database
1. Go to your Appwrite Console → Databases
2. Click "Create Database"
3. **Database Name:** `pdf-flex-db`
4. **Database ID:** `pdf-flex-db` (use the same as name)
5. Click "Create"

### Storage Buckets
1. Go to your Appwrite Console → Storage
2. Create two buckets with the following details:

#### Bucket 1: Input Files
- **Name:** `input-files`
- **Bucket ID:** `input-files`
- **File Security:** Enabled
- **Maximum File Size:** 104857600 (100MB in bytes)
- **Allowed File Extensions:** `pdf,jpg,jpeg,png`
- **Compression:** Enabled (optional)
- **Encryption:** Enabled (recommended)
- **Antivirus:** Enabled (if available)

#### Bucket 2: Output Files
- **Name:** `output-files`
- **Bucket ID:** `output-files`
- **File Security:** Enabled
- **Maximum File Size:** 104857600 (100MB)
- **Allowed File Extensions:** `pdf,jpg,jpeg,png,zip`
- **Compression:** Enabled (optional)
- **Encryption:** Enabled (recommended)

## Step 2: Copy Database and Bucket IDs

After creating, copy the IDs and add them to your `.env` file or use them in the setup script.

## Step 3: Run the Setup Script

After completing Step 1 and 2, run:

```bash
npm run setup-appwrite
```

This will create all collections with their attributes, indexes, and permissions.
