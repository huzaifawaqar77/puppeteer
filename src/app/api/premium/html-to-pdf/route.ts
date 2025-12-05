import { NextRequest, NextResponse } from "next/server";
import { gotenbergConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const gotenbergUrl = gotenbergConfig.url;
    const username = gotenbergConfig.username;
    const password = gotenbergConfig.password;

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );
    const authHeader = `Basic ${credentials}`;

    // Prepare Gotenberg request
    const gotenbergFormData = new FormData();
    let endpoint = "";

    if (type === "url") {
      const url = formData.get("url") as string;
      if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }
      endpoint = "/forms/chromium/convert/url";
      gotenbergFormData.append("url", url);
    } else if (type === "file") {
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }
      endpoint = "/forms/chromium/convert/html";
      // Gotenberg requires the main file to be named 'index.html'
      gotenbergFormData.append("files", file, "index.html");
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Add common options
    gotenbergFormData.append("marginTop", "0");
    gotenbergFormData.append("marginBottom", "0");
    gotenbergFormData.append("marginLeft", "0");
    gotenbergFormData.append("marginRight", "0");
    gotenbergFormData.append("printBackground", "true");

    // Call Gotenberg API
    const response = await fetch(`${gotenbergUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: gotenbergFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gotenberg API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Gotenberg API failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    console.error("HTML to PDF Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
