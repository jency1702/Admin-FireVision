const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const fireEventsRoutes = require("./routes/fireEvents");
const alertsRoutes = require("./routes/alerts");
const predictionsRoutes = require("./routes/predictions");

app.use("/api/fire-events", fireEventsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/predictions", predictionsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "FireVision API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      fireEvents: "/api/fire-events",
      alerts: "/api/alerts",
      predictions: "/api/predictions",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 FireVision Backend running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
