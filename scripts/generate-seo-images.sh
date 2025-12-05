#!/bin/bash
# SEO Images Generation Guide for OmniPDF
# This script documents the images needed for complete SEO setup

# Images needed in /public folder:
# 1. og-image.png (1200x630px) - Open Graph image for social sharing
# 2. og-image-square.png (800x800px) - Square variant for social media
# 3. twitter-image.png (1200x675px) - Twitter/X card image
# 4. favicon-192.png (192x192px) - Android chrome icon
# 5. favicon-512.png (512x512px) - Android chrome large icon
# 6. apple-icon.png (180x180px) - Apple touch icon
# 7. apple-icon-152.png (152x152px) - iPad touch icon

echo "Please create the following PNG images:"
echo "1. og-image.png (1200x630px) - Open Graph image"
echo "2. og-image-square.png (800x800px) - Square variant"
echo "3. twitter-image.png (1200x675px) - Twitter card"
echo "4. favicon-192.png (192x192px) - Android icon"
echo "5. favicon-512.png (512x512px) - Android large icon"
echo "6. apple-icon.png (180x180px) - Apple touch icon"
echo "7. apple-icon-152.png (152x152px) - iPad touch icon"

# Web manifest for PWA
echo "Creating web.manifest.json..."
cat > public/manifest.json << 'EOF'
{
  "name": "OmniPDF - Master Your PDFs",
  "short_name": "OmniPDF",
  "description": "Transform your PDFs with 40+ powerful tools",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1f2937",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/favicon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
EOF

echo "manifest.json created successfully!"
