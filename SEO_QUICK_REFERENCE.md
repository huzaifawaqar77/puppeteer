# OmniPDF SEO Quick Reference

## ðŸŒ Public URLs

### Sitemaps

```
https://omnipdf.uiflexer.com/sitemap.xml          (Main sitemap)
https://omnipdf.uiflexer.com/sitemap-tools.xml    (Tools sitemap - 41 tools)
https://omnipdf.uiflexer.com/sitemap-blog.xml     (Blog sitemap - 4 blog posts)
```

### Robots & Config

```
https://omnipdf.uiflexer.com/robots.txt           (SEO robots configuration)
https://omnipdf.uiflexer.com/manifest.json        (PWA manifest)
```

### Meta Information

```
https://omnipdf.uiflexer.com/favicon.svg          (Scalable favicon)
https://omnipdf.uiflexer.com/favicon.png          (32x32 favicon)
https://omnipdf.uiflexer.com/og-image.png         (1200x630 OG image)
https://omnipdf.uiflexer.com/twitter-image.png    (1200x675 Twitter card)
```

## ðŸ“Š SEO Metrics

### Page Priorities (in sitemap.xml)

| Page     | Priority | Changefreq |
| -------- | -------- | ---------- |
| Home     | 1.0      | weekly     |
| Tools    | 0.95     | weekly     |
| Premium  | 0.9      | monthly    |
| Blog     | 0.85     | weekly     |
| API Docs | 0.85     | monthly    |
| About Us | 0.8      | monthly    |
| Contact  | 0.8      | monthly    |
| Privacy  | 0.5      | yearly     |
| Legal    | 0.5      | yearly     |

### Metadata per Page

Each page includes:

- âœ… Unique title tag (60 chars)
- âœ… Unique meta description (160 chars)
- âœ… Open Graph image (1200x630)
- âœ… Open Graph type
- âœ… Twitter card configuration
- âœ… Keywords (when applicable)
- âœ… Author/Creator info
- âœ… Robots directive

## ðŸ¤– Robots.txt Configuration

### Allowed

- `/` (home)
- `/tools` (all tool pages)
- `/premium` (premium features)
- `/blog` (blog posts)
- `/about-us` (about page)
- `/contact-us` (contact page)
- `/privacy-policy` (legal)
- `/legal-notice` (legal)

### Disallowed

- `/api/*` (API endpoints - not for search)
- `/admin/*` (admin routes)
- `/dashboard/*` (user dashboard)
- `/settings/*` (user settings)
- `/login` (authentication pages)
- `/register` (registration)

### Crawl Settings

- Crawl-delay: 1 second
- User-agent: \* (all bots)

## ðŸ“± Image Assets Summary

### Favicons (9 total)

```
favicon.svg          - Scalable favicon
favicon.png          - 32x32 browser tab icon
favicon-192.png      - 192x192 Android icon
favicon-512.png      - 512x512 Android splash
apple-icon.png       - 180x180 Apple touch icon
apple-icon-152.png   - 152x152 iPad icon
og-image.png         - 1200x630 Open Graph
og-image-square.png  - 800x800 Square variant
twitter-image.png    - 1200x675 Twitter card
```

### Image Specifications

#### Open Graph (og-image.png)

- **Size**: 1200x630px
- **Format**: PNG
- **Purpose**: Default social media image
- **Aspect Ratio**: 1.9:1 (landscape)

#### Twitter Card (twitter-image.png)

- **Size**: 1200x675px
- **Format**: PNG
- **Purpose**: Twitter/X social card
- **Aspect Ratio**: 16:9 (landscape)

#### Square Variant (og-image-square.png)

- **Size**: 800x800px
- **Format**: PNG
- **Purpose**: Pinterest, Instagram, Square displays
- **Aspect Ratio**: 1:1 (square)

#### Android Icons

- **favicon-192.png**: Home screen icon
- **favicon-512.png**: Splash screen and app store
- **Format**: PNG with transparency
- **Purpose**: PWA and Chrome installation

#### Apple Icons

- **apple-icon.png**: iPhone home screen (180x180)
- **apple-icon-152.png**: iPad home screen (152x152)
- **Format**: PNG with rounded corners
- **Purpose**: iOS "Add to Home Screen"

## ðŸ”— Structured Data (JSON-LD)

### Schemas Implemented

1. **Organization Schema**

   - Company name and description
   - Website URL
   - Logo URL
   - Social media profiles
   - Contact information

2. **Website Schema**

   - Site name and URL
   - Search functionality
   - Search template for Google

3. **SoftwareApplication Schema**
   - App name and category
   - Description
   - URL
   - Pricing information
   - Rating (if applicable)

### Rich Snippets Benefits

- Better Google search result display
- Enhanced knowledge panels
- Voice search optimization
- Structured data validation

## ðŸŽ¯ SEO Best Practices Implemented

### âœ… On-Page SEO

- Unique title tags (under 60 chars)
- Descriptive meta descriptions (under 160 chars)
- Heading hierarchy (H1, H2, H3)
- Internal linking via Footer
- Descriptive URLs
- Mobile-responsive design

### âœ… Technical SEO

- XML sitemaps
- robots.txt
- Meta robots tags
- Canonical URLs (via Next.js)
- Structured data
- Mobile viewport
- Fast page load (Next.js optimized)
- HTTPS support
- PWA capability

### âœ… Social SEO

- Open Graph tags
- Twitter card tags
- Social sharing images
- Author/Creator attribution
- Social media links in Footer

### âœ… Content SEO

- Keyword-rich content
- Semantic HTML
- Proper heading structure
- Internal linking strategy
- Blog with timestamps
- Related content links

## ðŸ“‹ Checklist for Launch

### Before Going Live

- [ ] Test all sitemaps in browser
- [ ] Verify all images display correctly
- [ ] Test social media preview links
- [ ] Check mobile responsiveness
- [ ] Verify Page Speed Insights score
- [ ] Check Core Web Vitals
- [ ] Verify manifest.json loads
- [ ] Test PWA installability
- [ ] Check schema validation

### After Going Live

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Request indexing of home page
- [ ] Set up Google Analytics 4
- [ ] Set up Search Console monitoring
- [ ] Monitor for crawl errors
- [ ] Track keyword rankings
- [ ] Monitor organic traffic

## ðŸ” Testing Tools

### Metadata Testing

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/
- **Pinterest**: https://developers.pinterest.com/tools/url-debugger/

### Schema Validation

- **Google**: https://schema.org/validator
- **JSON-LD**: https://json-ld.org/playground/

### SEO Tools

- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- **Google PageSpeed**: https://developers.google.com/speed/pagespeed/insights
- **GTmetrix**: https://gtmetrix.com
- **Lighthouse**: Built into Chrome DevTools

### Sitemap Testing

- **XML Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

## ðŸ“ˆ Success Metrics to Track

### Rankings

- Google Search Console: Monitor top 10 keywords
- Track monthly ranking changes
- Monitor click-through rates (CTR)

### Traffic

- Google Analytics: Monitor organic traffic
- Track page-by-page performance
- Monitor bounce rate and engagement

### Indexing

- Google Search Console: Monitor indexed pages
- Track crawl errors
- Monitor coverage

### Performance

- Core Web Vitals scores
- Page load times
- Mobile performance

## ðŸ’¡ Tips for Better SEO

### Content Updates

- Blog consistently (aim for 1-2 posts/month)
- Update existing content with new information
- Refresh outdated blog posts
- Add internal links to new content

### Link Building

- Get mentioned on PDF-related websites
- Create high-quality content worth linking to
- Submit to industry directories
- Reach out to relevant bloggers

### Technical Maintenance

- Monitor crawl errors in Search Console
- Fix broken links
- Update outdated content
- Improve Core Web Vitals

### Social Signals

- Share blog posts on social media
- Encourage social sharing
- Engage with comments
- Cross-promote content

---

**Last Updated**: December 5, 2025
**Status**: âœ… COMPLETE AND LIVE
**Next Review**: Monthly

