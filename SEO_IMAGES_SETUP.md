# SEO Images Setup Guide for OmniPDF

This guide explains how to create all necessary SEO-related images for OmniPDF.

## Required Images

### 1. **Open Graph Images** (Social Media Sharing)

#### og-image.png (1200x630px)

- **Purpose**: Default Open Graph image for all pages
- **Used for**: Facebook, LinkedIn, Twitter (when specific image not provided)
- **Design**: OmniPDF logo with "Master Your PDFs with 40+ Tools"
- **Location**: `/public/og-image.png`

#### og-image-square.png (800x800px)

- **Purpose**: Square variant for better platform compatibility
- **Used for**: Pinterest, some social platforms
- **Design**: Centered OmniPDF logo in square format
- **Location**: `/public/og-image-square.png`

### 2. **Twitter/X Card Image**

#### twitter-image.png (1200x675px)

- **Purpose**: Optimized for Twitter/X cards
- **Used for**: Twitter/X social sharing
- **Design**: Similar to og-image but optimized for Twitter dimensions
- **Location**: `/public/twitter-image.png`

### 3. **Favicon & App Icons**

#### favicon.png (32x32px)

- **Purpose**: Browser tab icon
- **Design**: Simplified OmniPDF logo
- **Location**: `/public/favicon.png` (Already exists)

#### favicon.svg

- **Purpose**: Scalable favicon
- **Design**: OmniPDF logo in SVG format
- **Location**: `/public/favicon.svg` (Already exists)

#### favicon-192.png (192x192px)

- **Purpose**: Android Chrome home screen icon
- **Used for**: Android devices, PWA
- **Design**: Full OmniPDF logo with padding
- **Location**: `/public/favicon-192.png`

#### favicon-512.png (512x512px)

- **Purpose**: Android Chrome splash screen, PWA
- **Used for**: High-resolution Android devices
- **Design**: Full OmniPDF logo with padding
- **Location**: `/public/favicon-512.png`

### 4. **Apple Touch Icons**

#### apple-icon.png (180x180px)

- **Purpose**: iPhone/iPad home screen icon
- **Used for**: iOS Safari "Add to Home Screen"
- **Design**: Full OmniPDF logo with rounded corners
- **Location**: `/public/apple-icon.png`

#### apple-icon-152.png (152x152px)

- **Purpose**: iPad home screen icon
- **Used for**: iPad "Add to Home Screen"
- **Design**: Same as apple-icon but smaller
- **Location**: `/public/apple-icon-152.png`

## How to Create These Images

### Option 1: Using Figma (Recommended)

1. Create a new Figma project
2. Create artboards for each image size
3. Design OmniPDF logo and branding elements
4. Export each artboard as PNG/SVG
5. Optimize images using ImageOptim or TinyPNG

### Option 2: Using Online Tools

- **Favicon Generator**: https://realfavicongenerator.net/
- **OG Image Generator**: https://www.kapwing.com/tools/social-media-image-maker
- **Image Resizer**: https://imageresizer.com/

### Option 3: Using Python (Automated)

```python
from PIL import Image, ImageDraw, ImageFont

# Example: Creating a simple OmniPDF image
def create_og_image():
    width, height = 1200, 630
    image = Image.new('RGB', (width, height), color='#1f2937')
    draw = ImageDraw.Draw(image)

    # Add text or logo
    # ... (add your design code)

    image.save('public/og-image.png', 'PNG', optimize=True)

if __name__ == "__main__":
    create_og_image()
```

## Optimization Tips

1. **Compress Images**:

   - Use TinyPNG (https://tinypng.com/) for PNG compression
   - Maintain quality while reducing file size
   - Target: Keep each image under 150KB

2. **Naming Convention**:

   - Use kebab-case for filenames (e.g., `apple-icon.png`)
   - Keep names consistent and descriptive

3. **Color Consistency**:
   - Use primary color: `#FF6B35` (OmniPDF orange)
   - Use background: `#1f2937` (dark gray)
   - Use accent: `#FFA500` (orange)

## Testing Your Images

### Test Social Media Preview

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/inspect/

### Test PWA Icons

- Use Chrome DevTools to test manifest.json
- Check "Application" tab in DevTools

## Files Already Created

- ✅ `/public/robots.txt` - SEO robots configuration
- ✅ `/public/sitemap.xml` - Main sitemap
- ✅ `/public/manifest.json` - PWA manifest
- ✅ `/src/app/sitemap-tools.xml/route.ts` - Tools sitemap
- ✅ `/src/app/sitemap-blog.xml/route.ts` - Blog sitemap
- ✅ Metadata for all pages configured
- ✅ JSON-LD structured data added
- ✅ Open Graph and Twitter cards configured

## Next Steps

1. Create all PNG/SVG images listed above
2. Place them in `/public` folder
3. Run `npm run build` to verify everything compiles
4. Test with Google Search Console
5. Submit sitemaps to Google and Bing

## SEO Checklist

- ✅ Metadata configured for all pages
- ✅ Open Graph images configured
- ✅ Twitter cards configured
- ✅ Robots.txt created
- ✅ Sitemaps created
- ✅ Manifest.json created
- ✅ JSON-LD structured data added
- ✅ Mobile-friendly meta tags added
- ⏳ Create and upload PNG/SVG images
- ⏳ Submit to Google Search Console
- ⏳ Submit to Bing Webmaster Tools
- ⏳ Set up Google Analytics 4
