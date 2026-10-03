const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const workLogRoutes = require("./routes/workLogRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env file");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing in .env file");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: "https://recorder-frontend-nine.vercel.app",
  })
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  });

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Recorder Backend is running",
  });
});

// API routes
app.use("/api/projects", projectRoutes);
app.use("/api/work-logs", workLogRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});