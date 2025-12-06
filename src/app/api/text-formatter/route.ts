import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, instructions } = await request.json();

    if (!text || !instructions) {
      return NextResponse.json(
        { error: "Text and instructions are required" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a data extraction and formatting specialist. Your task is to process the following text according to the user's instructions and return ONLY valid JSON format.

USER INSTRUCTIONS:
${instructions}

TEXT TO PROCESS:
${text}

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown formatting, no code blocks (no \`\`\`json)
2. If the text is not related to the requested formatting, return an error object: {"error": "Text content is not related to the requested format"}
3. Ensure all field names are lowercase and use underscores instead of spaces
4. Handle nested data appropriately using objects and arrays
5. Only include relevant fields based on the text provided
6. If a field cannot be extracted from the text, omit it from the output

Respond with ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().trim();

    // Parse the JSON response
    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Failed to parse AI response as JSON. The text might not be suitable for the requested format.",
        },
        { status: 400 }
      );
    }

    // Check if AI returned an error
    if (parsedData.error) {
      return NextResponse.json(
        { error: parsedData.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Text formatter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to format text" },
      { status: 500 }
    );
  }
}
