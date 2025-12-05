#!/usr/bin/env python3
"""
SEO Image Generator for OmniPDF
Generates all necessary SEO-related images (favicons, OG images, etc.)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Colors
PRIMARY_COLOR = "#FF6B35"  # Orange
DARK_BG = "#1f2937"  # Dark gray
ACCENT_COLOR = "#FFA500"  # Light orange
WHITE = "#FFFFFF"

# Create public folder if it doesn't exist
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def create_image_with_text(
    width: int, height: int, filename: str, text: str = "OmniPDF", subtitle: str = ""
):
    """Create an image with OmniPDF branding"""
    image = Image.new("RGB", (width, height), color=DARK_BG)
    draw = ImageDraw.Draw(image)

    # Draw gradient-like effect (simplified)
    for i in range(height):
        # Create a subtle gradient
        color_value = int(31 + (25 * (i / height)))
        color = f"#{color_value:02x}{color_value:02x}{color_value:02x}"

    # Add main text
    text_color = PRIMARY_COLOR

    # Calculate text position (center)
    mid_x = width // 2
    mid_y = height // 2

    # Draw main heading
    draw.text((mid_x, mid_y - 20), text, fill=text_color, anchor="mm", align="center")

    # Draw subtitle if provided
    if subtitle:
        draw.text((mid_x, mid_y + 40), subtitle, fill=WHITE, anchor="mm", align="center")

    filepath = os.path.join(OUTPUT_DIR, filename)
    image.save(filepath, "PNG", optimize=True)
    print(f"✓ Created {filename} ({width}x{height}px)")
    return filepath


def create_og_image():
    """Create 1200x630 Open Graph image"""
    create_image_with_text(
        1200, 630, "og-image.png", text="OmniPDF", subtitle="Master Your PDFs with 40+ Tools"
    )


def create_og_square():
    """Create 800x800 square OG image"""
    create_image_with_text(800, 800, "og-image-square.png", text="OmniPDF")


def create_twitter_image():
    """Create 1200x675 Twitter card image"""
    create_image_with_text(
        1200, 675, "twitter-image.png", text="OmniPDF", subtitle="40+ Free PDF Tools"
    )


def create_android_icons():
    """Create Android Chrome icons"""
    # 192x192
    create_image_with_text(192, 192, "favicon-192.png", text="O")

    # 512x512
    create_image_with_text(512, 512, "favicon-512.png", text="O")


def create_apple_icons():
    """Create Apple touch icons"""
    # 180x180
    create_image_with_text(180, 180, "apple-icon.png", text="O")

    # 152x152
    create_image_with_text(152, 152, "apple-icon-152.png", text="O")


def main():
    """Generate all SEO images"""
    print("🎨 Generating SEO images for OmniPDF...")
    print()

    try:
        create_og_image()
        create_og_square()
        create_twitter_image()
        create_android_icons()
        create_apple_icons()

        print()
        print("✅ All SEO images generated successfully!")
        print(f"📁 Images saved to: {OUTPUT_DIR}")
        print()
        print("Next steps:")
        print("1. Review the generated images")
        print("2. Customize them in design tools (Figma, Photoshop, etc.)")
        print("3. Optimize with TinyPNG if needed")
        print("4. Run: npm run build")

    except Exception as e:
        print(f"❌ Error generating images: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
