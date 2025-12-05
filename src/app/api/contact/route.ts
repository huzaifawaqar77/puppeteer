import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiter function: 5 requests per IP per hour
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }

  if (record.count >= 5) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

// Validate form data
function validateFormData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid form data" };
  }

  const { name, email, subject, message } = data as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (
    !email ||
    typeof email !== "string" ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return { valid: false, error: "Valid email is required" };
  }

  if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
    return { valid: false, error: "Subject is required" };
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return { valid: false, error: "Message must be at least 10 characters" };
  }

  return { valid: true };
}

// Configure nodemailer transporter with Zoho SMTP
function getTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email configuration missing from environment variables");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.zoho.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE !== "false",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate form data
    const validation = validateFormData(body);
    if (!validation.valid) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const { name, email, subject, message } = body;

    // Get transporter
    const transporter = getTransporter();

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@uiflexer.com",
      to: process.env.ADMIN_EMAIL || "huzaifawaqar77@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <hr />
          <p style="color: #666; font-size: 12px;">
            This email was sent from your contact form. Reply directly to ${escapeHtml(
              email
            )} to respond.
          </p>
        </div>
      `,
      replyTo: email,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@uiflexer.com",
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Thank You, ${escapeHtml(name)}!</h2>
          <p>We received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap; color: #666;">${escapeHtml(
              message
            )}</p>
          </div>
          <p>
            <strong>Expected Response Time:</strong><br />
            General Inquiries: 24-48 hours<br />
            Support Issues: 12-24 hours
          </p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            Do not reply to this email. If you have additional questions, please use our contact form again.
          </p>
        </div>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json(
      { message: "Message sent successfully! We will be in touch soon." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
