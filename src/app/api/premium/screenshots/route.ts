import { GotenbergClient } from "@/lib/gotenberg";

const client = new GotenbergClient({
  url: process.env.GOTENBERG_URL || "https://gotenberg.uiflexer.com",
  username: process.env.GOTENBERG_USERNAME || "Znlz6EqYM09GmcJB",
  password:
    process.env.GOTENBERG_PASSWORD || "l1neT52mJSFRbiopVzEZLz6K0HrB6uqG",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const url = formData.get("url") as string;
    const format = (formData.get("format") as string) || "png"; // png, jpeg, webp
    const width = formData.get("width")
      ? parseInt(formData.get("width") as string)
      : 1920;
    const height = formData.get("height")
      ? parseInt(formData.get("height") as string)
      : 1080;
    const scale = formData.get("scale")
      ? parseFloat(formData.get("scale") as string)
      : 1;
    const delay = formData.get("delay")
      ? parseInt(formData.get("delay") as string)
      : 0;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create form data for Gotenberg
    const screenshotFormData = new FormData();
    screenshotFormData.append("url", url);
    screenshotFormData.append("format", format);
    screenshotFormData.append("width", width.toString());
    screenshotFormData.append("height", height.toString());
    screenshotFormData.append("scale", scale.toString());
    if (delay > 0) {
      screenshotFormData.append("delay", delay.toString());
    }

    const blob = await client.sendRequest(
      "/forms/chromium/screenshot/url",
      screenshotFormData,
      120000
    );

    const buffer = await blob.arrayBuffer();
    const mimeType =
      format === "png"
        ? "image/png"
        : format === "jpeg"
        ? "image/jpeg"
        : "image/webp";
    const filename = `screenshot.${format}`;

    const response = new Response(buffer);
    response.headers.set("Content-Type", mimeType);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    return response;
  } catch (error: any) {
    console.error("Screenshot Error:", error);
    return new Response(
      JSON.stringify({
        error: `Gotenberg API Error: ${error.message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
