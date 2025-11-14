require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Initialize express app
const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log(`🚀 Starting PDF Generation SaaS in ${NODE_ENV} mode`);
console.log(`📡 Port: ${PORT}`);

// Trust proxy - Required when behind reverse proxy (Nginx, Coolify, etc.)
app.set("trust proxy", 1);

// --- Security Middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for landing page
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api/", limiter);

// --- Body Parser Middleware ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Import Routes ---
const authRoutes = require("./routes/auth");
const pdfRoutes = require("./routes/pdf");
const subscriptionRoutes = require("./routes/subscription");
const aiRoutes = require("./routes/ai");
const apiKeysRoutes = require("./routes/apiKeys");
const docsRoutes = require("./routes/docs");
const brandingRoutes = require("./routes/branding");

// --- Health Check ---
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// --- Documentation Routes (Protected) - MUST BE BEFORE STATIC FILES ---
app.use("/", docsRoutes);

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/keys", apiKeysRoutes);
app.use("/api/branding", brandingRoutes);

// --- Static Files (with exclusions for protected routes) ---
app.use((req, res, next) => {
  // Block direct access to docs.html - must go through protected route
  if (req.path === "/docs.html" || req.path === "/docs-content.html") {
    return next(); // Let the docs route handler deal with it
  }
  express.static(path.join(__dirname, "public"))(req, res, next);
});

// --- Landing Page Route ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- API Documentation Route (Legacy - Markdown) ---
app.get("/API_DOCUMENTATION.md", (req, res) => {
  res.sendFile(path.join(__dirname, "API_DOCUMENTATION.md"));
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ PDF Generation SaaS API listening on port ${PORT}`);
  console.log(`🌐 Access the landing page at: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});
