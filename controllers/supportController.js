const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");
const juice = require("juice");
const { convert } = require("html-to-text");

const sendEmail = async (req, res) => {
  const { subject, body, bodyHtml } = req.body;
  const { user } = req; // User data from protect middleware

  if (!subject || (!body && !bodyHtml)) {
    return res.status(400).json({
      success: false,
      message: "Subject and message body are required.",
    });
  }

  // Create a transporter using SMTP details from .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true", // Use 'true' for 465, 'false' for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Prepare content: sanitize incoming HTML if provided, otherwise escape/simple transform of plain text
  let sanitizedUserHtml = null;
  if (bodyHtml) {
    sanitizedUserHtml = sanitizeHtml(bodyHtml, {
      allowedTags: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre"
      ],
      allowedAttributes: {
        a: ["href", "name", "target", "rel"]
      },
      transformTags: {
        'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }, false)
      },
      allowedSchemes: ["http", "https", "mailto"]
    });
  }

  const userContentHtml = sanitizedUserHtml
    ? sanitizedUserHtml
    : `<p>${(body || "").replace(/\n/g, "<br>")}</p>`;

  // Basic template and styles (adjust to your branding). We'll inline CSS for email compatibility.
  const templateCss = `
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; }
    .header { background:#f8fafc; padding:12px 16px; border-bottom:1px solid #e6edf3 }
    .footer { color:#6b7280; font-size:12px; padding:12px 16px; border-top:1px solid #e6edf3 }
    .content { padding:16px }
    a { color:#2563eb }
  `;

  const templateHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>${templateCss}</style>
      </head>
      <body>
        <div class="header">
          <strong>PDF SaaS Support</strong>
        </div>
        <div class="content">
          <p><strong>From:</strong> ${user.full_name || user.email} (${user.email})</p>
          <p><strong>User ID:</strong> ${user.id}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          ${userContentHtml}
        </div>
        <div class="footer">
          <p>This message was sent via PDF SaaS support portal.</p>
        </div>
      </body>
    </html>
  `;

  // Inline CSS for email clients
  const inlinedHtml = juice(templateHtml);
  const textFallback = convert(inlinedHtml, { wordwrap: 130 });

  // Email options - use configured support sender to avoid relay issues
  const mailOptions = {
    from: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    replyTo: user.email,
    to: process.env.SUPPORT_RECEIVER_EMAIL || "huzaifa@uiflexer.com",
    subject: `Support Request: ${subject}`,
    html: inlinedHtml,
    text: textFallback,
  };

  try {
    // Verify connection/configuration first to provide clearer errors for auth/relay problems
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending support email:", {
      message: error && error.message,
      response: error && error.response,
      stack: error && error.stack,
    });

    // Relay errors or auth errors often include useful response text; bubble it up when available.
    const errMessage =
      (error && (error.response || error.message)) || "Failed to send email.";
    res.status(500).json({ success: false, message: errMessage });
  }
};

module.exports = { sendEmail };
