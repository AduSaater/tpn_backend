require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const authController = require("./controllers/authController");
const tpnController = require("./controllers/tpnController");
const documentController = require("./controllers/documentController");
const uploadMiddleware = require("./middleware/uploadMiddleware");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());
app.use(cors());
// Routes
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.post(
  "/api/tpn/apply",
  authMiddleware(["individual", "dealer"]),
  tpnController.createTPN
);
app.get(
  "/api/tpn/my-applications",
  authMiddleware(["individual", "dealer"]),
  tpnController.getUserApplications
);
app.post(
  "/api/tpn/renew",
  authMiddleware(["individual", "dealer"]),
  tpnController.renewTPN
);
app.post(
  "/api/tpn/verify",
  authMiddleware(["frsc_admin", "enforcement"]),
  tpnController.verifyTPN
);
app.post(
  "/api/document/upload",
  authMiddleware(["individual", "dealer"]),
  uploadMiddleware.single("document"),
  documentController.uploadDocument
);
app.get(
  "/api/document/:tpnId",
  authMiddleware(["individual", "dealer", "frsc_admin", "enforcement"]),
  documentController.getDocuments
);
app.get(
  "/api/user/details",
  authMiddleware(["individual", "dealer", "frsc_admin", "enforcement"]),
  documentController.getUserDetails
);
app.get(
  "/api/admin/users",
  authMiddleware(["frsc_admin", "enforcement"]),
  documentController.getAllUsers
);

app.get(
  "/api/admin/users/:userId",
  authMiddleware(["frsc_admin", "enforcement"]),
  documentController.getUserById
);

app.put(
  "/api/admin/users/:userId",
  authMiddleware(["frsc_admin", "enforcement"]),
  documentController.updateUser
);

app.delete(
  "/api/admin/users/:userId",
  authMiddleware(["frsc_admin", "enforcement"]),
  documentController.deleteUser
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Supabase connection
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
});
pool.on("error", (err) => {
  console.error("Supabase pool error:", err.stack);
});
pool.connect((err) => {
  if (err) {
    console.error("Failed to connect to Supabase:", err.stack);
  } else {
    console.log("Connected to Supabase PostgreSQL database");
  }
});
