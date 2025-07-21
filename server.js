const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const tpnRoutes = require("./routes/tpnRoutes");
const documentRoutes = require("./routes/documentRoutes");

dotenv.config();
const app = express();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

// Middleware to parse JSON bodies
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
    return;
  }
  console.log("Connected to Supabase PostgreSQL database");
  release();
});

// Middleware to parse JSON bodies
app.use(express.json());

// API routes
router.get("/test", async (req, res) => {
  try {
    console.log("Reached /test route");
    res.status(200).json({ message: "Test route working" });
  } catch (err) {
    console.error("Error in test route:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/tpn", tpnRoutes);
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});
const PORT = process.env.PORT || 5000;
try {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (e) {
  console.error("❌ Server failed to start:", e.message);
}
