# Blog System Setup & Documentation

## Overview

The blog system is a fully-featured public blog platform for SEO and content marketing. It's built with Next.js, React, TypeScript, and Appwrite, featuring:

- **Dynamic blog listing** with search and category filtering
- **Individual blog posts** with Markdown rendering
- **Social sharing** capabilities (Twitter, Facebook, LinkedIn)
- **View tracking** to monitor blog engagement
- **Responsive design** for mobile, tablet, and desktop
- **Public access** (no authentication required for reading)

## Quick Start

### 1. Install Dependencies

First, ensure `react-markdown` is installed:

```bash
npm install
```

This will install `react-markdown` (already added to `package.json`).

### 2. Set Up the Database Collection

Run the setup script to create the blogs collection in Appwrite:

```bash
npm run setup-blogs
```

This will:

- Create a `blogs` collection in the Appwrite database
- Set up 14 attributes for blog data
- Create 4 optimized database indexes
- Seed 4 sample blogs for testing

### 3. Start the Development Server

```bash
npm run dev
```

Then visit:

- **Blog List**: http://localhost:3000/blog
- **Sample Blog**: http://localhost:3000/blog/getting-started-with-pdf-conversion

## Database Schema

### Collection: `blogs`

**Attributes:**

| Name          | Type     | Size   | Required | Description                            |
| ------------- | -------- | ------ | -------- | -------------------------------------- |
| title         | String   | 255    | Yes      | Blog post title                        |
| slug          | String   | 255    | Yes      | URL-friendly slug (unique)             |
| description   | String   | 500    | Yes      | SEO description (shown in lists)       |
| content       | String   | 10,000 | Yes      | Full Markdown content                  |
| excerpt       | String   | 500    | Yes      | Short excerpt for previews             |
| author        | String   | 100    | Yes      | Author name                            |
| category      | String   | 50     | Yes      | Blog category (indexed for filtering)  |
| featuredImage | String   | 500    | No       | Featured image URL                     |
| tags          | String   | 500    | No       | Comma-separated tags                   |
| readTime      | Integer  | -      | Yes      | Estimated reading time in minutes      |
| views         | Integer  | -      | Yes      | View counter (default: 0)              |
| publishedAt   | DateTime | -      | Yes      | Publication date (indexed for sorting) |
| updatedAt     | DateTime | -      | No       | Last update date                       |
| published     | Boolean  | -      | Yes      | Publish status (indexed for filtering) |

**Indexes:**

- `slug` (unique, for quick lookups)
- `category` (for category filtering)
- `published` (for filtering published blogs)
- `publishedAt` (for sorting by date)

**Permissions:**

- Public read access (anyone can read)
- Restricted write access (admin only)

## Frontend Routes

### Public Routes (No Authentication)

- **`/blog`** - Blog listing page with search and filters
- **`/blog/[slug]`** - Individual blog post page

Both routes are fully responsive and SEO-optimized.

## Hooks & Data Fetching

### `useBlogs(category?: string, limit?: number)`

Fetch multiple published blogs:

```typescript
import { useBlogs } from "@/hooks/useBlogs";

export function BlogsList() {
  const { blogs, loading, error } = useBlogs("tutorial", 10);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {blogs.map((blog) => (
        <li key={blog.$id}>{blog.title}</li>
      ))}
    </ul>
  );
}
```

**Parameters:**

- `category` (optional): Filter by category
- `limit` (optional): Maximum number of blogs (default: 10)

**Returns:**

- `blogs`: Array of blog objects
- `loading`: Boolean indicating fetch state
- `error`: Error message string or null

### `useBlog(slug: string)`

Fetch a single blog post by slug (automatically increments view count):

```typescript
import { useBlog } from "@/hooks/useBlogs";

export function BlogPost() {
  const { blog, loading, error } = useBlog("my-blog-post");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Not found</div>;

  return <article>{blog.content}</article>;
}
```

**Parameters:**

- `slug`: The blog post slug

**Returns:**

- `blog`: Blog object or null
- `loading`: Boolean indicating fetch state
- `error`: Error message string or null

**Side Effects:**

- Automatically increments the `views` counter when the blog is fetched

### `getCategories()`

Get available blog categories:

```typescript
import { getCategories } from "@/hooks/useBlogs";

const categories = getCategories();
// Returns: ['tutorial', 'guide', 'news', 'feature-update']
```

### `getReadingTime(content: string)`

Calculate reading time from Markdown content:

```typescript
import { getReadingTime } from "@/hooks/useBlogs";

const time = getReadingTime("# My Blog\n\nLong content here...");
// Returns: 5 (minutes)
```

## Blog Features

### 1. Blog Listing Page (`/blog`)

**Features:**

- Hero section with gradient background
- Search bar for real-time filtering
- Category filter buttons
- Featured blog card (1/2 of grid on desktop)
- Responsive grid layout (1-3 columns)
- Blog cards with images, titles, excerpts, and metadata
- Loading states

**Search & Filter:**

- Searches across title, description, and excerpt
- Filter by category
- Results update in real-time

### 2. Blog Post Page (`/blog/[slug]`)

**Features:**

- Breadcrumb navigation
- Featured image with gradient overlay
- Rich metadata (author, date, read time, views)
- Social share buttons (Twitter, Facebook, LinkedIn)
- Full Markdown content with custom styling
- Author bio section
- Related articles from the same category
- Call-to-action section linking to tools
- Responsive typography

**Markdown Support:**

- Headings (h1-h3) with proper hierarchy
- Paragraphs with proper spacing
- Lists (ordered & unordered)
- Code blocks with background styling
- Inline code with monospace font
- Blockquotes with accent border
- Links with target="\_blank"

### 3. View Tracking

Views are automatically tracked when a blog is visited:

```javascript
// When /blog/[slug] loads, the views counter increments
const { blog, loading } = useBlog(slug);
// blog.views is automatically incremented
```

## Creating & Managing Blogs

### Via Appwrite Console (Manual)

1. Go to Appwrite Console
2. Navigate to your project → Database
3. Go to the `blogs` collection
4. Click "Add Document"
5. Fill in all required fields:
   - `title`: Blog title
   - `slug`: URL-friendly slug (e.g., "my-first-blog")
   - `description`: SEO description
   - `content`: Markdown content
   - `excerpt`: Short excerpt
   - `author`: Author name
   - `category`: Category name
   - `readTime`: Estimated read time (minutes)
   - `publishedAt`: Publication date
   - `published`: Set to `true`
6. Optionally add:
   - `featuredImage`: Image URL
   - `tags`: Comma-separated tags
   - `updatedAt`: Update date

### Via SDK (Programmatic)

```javascript
const { databases } = require("appwrite");
const { ID } = require("appwrite");

await databases.createDocument("pdf-flex-db", "blogs", ID.unique(), {
  title: "Getting Started with PDF Conversion",
  slug: "getting-started-with-pdf-conversion",
  description: "Learn how to convert various file formats to PDF",
  content: "# Getting Started\n\nMarkdown content here...",
  excerpt: "Learn how to convert files to PDF",
  author: "John Doe",
  category: "tutorial",
  featuredImage: "https://example.com/image.jpg",
  tags: "pdf,conversion,tutorial",
  readTime: 5,
  views: 0,
  publishedAt: new Date().toISOString(),
  published: true,
});
```

## Styling & Customization

### Color Variables Used

The blog uses these CSS variables (defined in Tailwind config):

- `--primary`: Primary brand color
- `--orange-500`: Orange accent
- `--secondary`: Secondary text color
- `--background`: Background color
- `--card`: Card background color
- `--foreground`: Text color

### Customizing Blog Layout

Blog pages are located in:

- `/src/app/blog/page.tsx` - Blog listing
- `/src/app/blog/[slug]/page.tsx` - Blog post

Both use Tailwind CSS classes and can be customized by editing these files.

### Customizing Markdown Rendering

The Markdown styling is configured in `/src/app/blog/[slug]/page.tsx` in the `components` prop of `<Markdown>`:

```typescript
<Markdown
  components={{
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl sm:text-4xl font-bold..." {...props} />
    ),
    // ... other components
  }}
>
  {blog.content}
</Markdown>
```

## SEO Optimization

### Current SEO Features

1. **Meta Tags**: The blog pages include proper titles and descriptions
2. **Semantic HTML**: Proper use of heading hierarchy and semantic elements
3. **Open Graph Tags**: (Can be added in layout.tsx)
4. **Sitemap**: Next.js generates sitemap automatically
5. **Clean URLs**: Slug-based URLs are SEO-friendly

### Future SEO Enhancements

To further improve SEO:

1. Add JSON-LD structured data
2. Create an XML sitemap with blog posts
3. Add Open Graph meta tags for social sharing
4. Implement canonical URLs
5. Add RSS feed for blogs

## Performance & Caching

### Optimizations in Place

1. **Next.js Image Optimization**: `next/image` component optimizes images
2. **Static Generation**: Blog pages are pre-generated at build time
3. **Incremental Static Regeneration (ISR)**: Can be configured for dynamic blog updates
4. **Query Optimization**: Database queries use indexes for fast filtering

### Monitoring

To monitor blog performance:

- Check view counts in each blog document
- Monitor page load times in browser DevTools
- Check Appwrite dashboard for query performance

## Troubleshooting

### Blogs Not Showing

1. **Check collection exists**: Verify `blogs` collection in Appwrite console
2. **Run setup script**: `npm run setup-blogs`
3. **Check published status**: Ensure blogs have `published: true`
4. **Check date**: Ensure `publishedAt` is set to a valid date

### Search Not Working

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check blog data**: Verify blogs have proper `title`, `description`, `excerpt`
3. **Check network tab**: Verify API calls are succeeding

### Images Not Loading

1. **Check featured image URL**: Ensure URL is valid and accessible
2. **Check CORS**: If images are from external source, verify CORS is configured
3. **Use valid image URL format**: URL should start with `http://` or `https://`

### View Tracking Not Working

1. **Check browser console**: Look for errors in DevTools
2. **Check Appwrite API key**: Verify API key has write permissions
3. **Check collection permissions**: Ensure app has permission to update documents

## Sample Blog Data

The setup script includes 4 sample blogs:

1. **Getting Started with PDF Conversion** (`getting-started-with-pdf-conversion`)
2. **Top 10 PDF Tools Features** (`top-10-pdf-tools-features`)
3. **Advanced PDF Processing Techniques** (`advanced-pdf-processing-techniques`)
4. **Privacy & Security in Document Management** (`privacy-security-document-management`)

These samples demonstrate:

- Proper blog structure
- Markdown content rendering
- Category organization
- Tag usage
- Reading time calculation

## API Integration

### Blog Endpoints

All blog data comes from Appwrite database collection `blogs`. The API is accessed via:

```typescript
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

// Example: Get blogs by category
const response = await databases.listDocuments(
  "pdf-flex-db", // database ID
  "blogs", // collection ID
  [
    Query.equal("published", true),
    Query.equal("category", "tutorial"),
    Query.orderDesc("publishedAt"),
    Query.limit(10),
  ]
);
```

### Required Appwrite Permissions

The application needs:

- **Read**: Public (for blog listing/posts)
- **Write**: Authenticated users with admin role (for creating/updating blogs)

## Future Enhancements

Potential features to add:

1. **Blog Admin Panel**: Create/edit/delete blogs via UI
2. **Comments System**: Allow readers to comment
3. **Newsletter Signup**: Add email subscription form
4. **Blog Analytics**: Dashboard showing views, popular posts
5. **Related Posts**: Smarter algorithm for related articles
6. **Categories Page**: Dedicated pages for each category
7. **Reading Progress**: Show scroll-based reading progress
8. **Social Media Auto-sharing**: Auto-post to social when published
9. **Email Notifications**: Alert subscribers to new posts
10. **Blog Archive**: Timeline view of all posts

## Support & Questions

For issues or questions:

1. Check Appwrite documentation: https://appwrite.io/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Check React documentation: https://react.dev
4. Review the implementation in:
   - `/src/hooks/useBlogs.ts` - Hook implementation
   - `/src/app/blog/page.tsx` - Blog listing
   - `/src/app/blog/[slug]/page.tsx` - Blog post
