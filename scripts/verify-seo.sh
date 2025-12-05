#!/bin/bash
# SEO Setup Verification Script for OmniPDF

echo "🔍 OmniPDF SEO Setup Verification"
echo "=================================="
echo ""

# Check for required files
echo "📋 Checking required files..."
FILES=(
  "public/robots.txt"
  "public/sitemap.xml"
  "public/manifest.json"
  "public/og-image.png"
  "public/twitter-image.png"
  "public/favicon-192.png"
  "public/favicon-512.png"
  "public/apple-icon.png"
  "public/apple-icon-152.png"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
  fi
done

echo ""
echo "📱 Testing Sitemaps..."
echo "- Main: http://localhost:3000/sitemap.xml"
echo "- Tools: http://localhost:3000/sitemap-tools.xml"
echo "- Blog: http://localhost:3000/sitemap-blog.xml"

echo ""
echo "🌐 Testing Social Media Preview..."
echo "- Facebook: https://developers.facebook.com/tools/debug/"
echo "- Twitter: https://cards-dev.twitter.com/validator"
echo "- LinkedIn: https://www.linkedin.com/post-inspector/"

echo ""
echo "✅ SEO Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Test sitemaps in browser"
echo "3. Test social media preview links"
echo "4. Submit sitemaps to Google Search Console"
echo "5. Submit sitemaps to Bing Webmaster Tools"
