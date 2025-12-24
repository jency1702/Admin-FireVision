// ============================================
// backend/server.js - MongoDB + Cloudinary
// ============================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  console.log(`${req.method} request received at: ${req.url}`);
  next();
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// MONGODB CONNECTION
// ============================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ============================================
// MONGOOSE SCHEMAS
// ============================================

// Fire Event Schema
const FireEventSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    label: { type: String, required: true },
    fireProbability: { type: Number, required: true },
    dangerScore: { type: Number, default: null },
    cause: { type: String, default: null },
    confidence: { type: Number, default: null },
    imageUrl: { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Alert Schema
const AlertSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ML Prediction Schema
const MLPredictionSchema = new mongoose.Schema(
  {
    ndvi: { type: Number, required: true },
    brightness: { type: Number, required: true },
    t31: { type: Number, required: true },
    confidence: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    prediction: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// CNN Prediction Schema
const CNNPredictionSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    label: { type: String, required: true },
    fireProbability: { type: Number, required: true },
    rawOutput: { type: Number, required: true },
    imageUrl: { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Models
const FireEvent = mongoose.model("FireEvent", FireEventSchema);
const Alert = mongoose.model("Alert", AlertSchema);
const MLPrediction = mongoose.model("MLPrediction", MLPredictionSchema);
const CNNPrediction = mongoose.model("CNNPrediction", CNNPredictionSchema);

// ============================================
// CLOUDINARY UPLOAD HELPER
// ============================================

const uploadToCloudinary = async (base64Image, folder = "fire-events") => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 900, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// ============================================
// GEMINI AI CHAT ROUTE  ✅ ADD THIS
// ============================================

app.post("/api/gemini/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ success: false, error: "Message is required" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: errText,
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: "Gemini API failed",
    });
  }
});

// ============================================
// FIRE EVENTS ROUTES
// ============================================

// Get all fire events
app.get("/api/fire-events", async (req, res) => {
  try {
    const events = await FireEvent.find().sort({ timestamp: -1 }).limit(100);

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get fire event by ID
app.get("/api/fire-events/:id", async (req, res) => {
  try {
    const event = await FireEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create fire event
app.post("/api/fire-events", async (req, res) => {
  try {
    const {
      source,
      label,
      fireProbability,
      dangerScore,
      cause,
      confidence,
      imageBase64,
    } = req.body;

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    let cloudinaryPublicId = null;

    if (imageBase64) {
      const uploadResult = await uploadToCloudinary(imageBase64, "fire-events");
      imageUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.publicId;
    }

    // Create new event in MongoDB
    const newEvent = new FireEvent({
      source: source || "Unknown",
      label: label || "Unknown",
      fireProbability: parseFloat(fireProbability) || 0,
      dangerScore: dangerScore ? parseInt(dangerScore) : null,
      cause: cause || null,
      confidence: confidence ? parseInt(confidence) : null,
      imageUrl,
      cloudinaryPublicId,
      timestamp: new Date(),
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      data: {
        id: newEvent._id,
        imageUrl: newEvent.imageUrl,
        message: "Fire event created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating fire event:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete fire event
app.delete("/api/fire-events/:id", async (req, res) => {
  try {
    const event = await FireEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // Delete image from Cloudinary if exists
    if (event.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(event.cloudinaryPublicId);
    }

    await FireEvent.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get fire statistics
app.get("/api/fire-events/statistics", async (req, res) => {
  try {
    const events = await FireEvent.find();
    const alerts = await Alert.countDocuments();

    const stats = {
      totalFires: 0,
      totalAlerts: alerts,
      avgDangerScore: 0,
      firesBySource: {},
      firesByCause: {},
    };

    let dangerScoreSum = 0;
    let dangerScoreCount = 0;

    events.forEach((event) => {
      if (event.label === "Fire") {
        stats.totalFires++;
      }

      if (event.dangerScore) {
        dangerScoreSum += event.dangerScore;
        dangerScoreCount++;
      }

      stats.firesBySource[event.source] =
        (stats.firesBySource[event.source] || 0) + 1;

      if (event.cause) {
        stats.firesByCause[event.cause] =
          (stats.firesByCause[event.cause] || 0) + 1;
      }
    });

    stats.avgDangerScore =
      dangerScoreCount > 0 ? Math.round(dangerScoreSum / dangerScoreCount) : 0;

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ALERTS ROUTES
// ============================================

app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/alerts", async (req, res) => {
  try {
    const { source, message } = req.body;

    if (!source || !message) {
      return res.status(400).json({
        success: false,
        error: "Source and message are required",
      });
    }

    const newAlert = new Alert({ source, message });
    await newAlert.save();

    res.status(201).json({
      success: true,
      data: { id: newAlert._id, message: "Alert created successfully" },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ML PREDICTIONS ROUTES
// ============================================

app.get("/api/predictions/ml", async (req, res) => {
  try {
    const predictions = await MLPrediction.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/predictions/ml", async (req, res) => {
  try {
    const newPrediction = new MLPrediction(req.body);
    await newPrediction.save();

    res.status(201).json({
      success: true,
      data: {
        id: newPrediction._id,
        message: "ML prediction created successfully",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CNN PREDICTIONS ROUTES
// ============================================

app.get("/api/predictions/cnn", async (req, res) => {
  try {
    const predictions = await CNNPrediction.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/predictions/cnn", async (req, res) => {
  try {
    const { source, label, fireProbability, rawOutput, imageBase64 } = req.body;

    let imageUrl = null;
    let cloudinaryPublicId = null;

    if (imageBase64) {
      const uploadResult = await uploadToCloudinary(
        imageBase64,
        "cnn-predictions"
      );
      imageUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.publicId;
    }

    const newPrediction = new CNNPrediction({
      source,
      label,
      fireProbability,
      rawOutput,
      imageUrl,
      cloudinaryPublicId,
    });

    await newPrediction.save();

    res.status(201).json({
      success: true,
      data: {
        id: newPrediction._id,
        message: "CNN prediction created successfully",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    cloudinary: {
      configured: !!process.env.CLOUDINARY_CLOUD_NAME,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "FireVision API Server",
    version: "3.0.0 (MongoDB + Cloudinary)",
    database: "MongoDB",
    storage: "Cloudinary",
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("🔥 FireVision Backend (MongoDB + Cloudinary)");
  console.log("=".repeat(70));
  console.log(`✓ Server: http://localhost:${PORT}`);
  console.log(
    `✓ Database: MongoDB ${mongoose.connection.readyState === 1 ? "✓" : "✗"}`
  );
  console.log(`✓ Images: Cloudinary`);
  console.log("=".repeat(70) + "\n");
});

module.exports = app;
