const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");       // <-- FIXED
const cors = require("cors");               // <-- FIXED

const connectDB = require("./db/db");
const Link = require("./db/Link");
const linkRoutes = require("./routes/linkRoutes");

// Load .env
dotenv.config();

// Connect database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());
app.use(cors());                          

// --- 1. HEALTH CHECK ---
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    environment: NODE_ENV,
    uptime: process.uptime(),
    database_status:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// --- 2. API ROUTES ---
app.use("/api/links", linkRoutes);

// --- 3. REDIRECT ROUTE ---
app.get("/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const link = await Link.incrementClicks(code);

    if (!link) {
      return res.status(404).send("TinyLink not found.");
    }

    return res.redirect(302, link.targetUrl);
  } catch (error) {
    console.error(`Redirect error for code ${code}:`, error);
    return res.status(500).send("Internal server error.");
  }
});

// --- 4. STATIC FRONTEND SERVING ---
const staticPath = path.join(__dirname, "..", "url-shortner", "build");  

if (NODE_ENV === "production" && require("fs").existsSync(staticPath)) {
  console.log(`Serving React app from ${staticPath}`);
  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  console.log("Development mode: React dev server must run separately.");
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
