// // ============================================
// // backend/server.js - Real-Time Alerts (Socket.io)
// // ============================================

// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const cloudinary = require("cloudinary").v2;
// const http = require("http");
// const socketIo = require("socket.io");

// // Load environment variables
// dotenv.config();

// // Initialize Express
// const app = express();
// const server = http.createServer(app);

// // ⭐ Initialize Socket.io for real-time alerts
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use((req, res, next) => {
//   console.log(`${req.method} request received at: ${req.url}`);
//   next();
// });

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ============================================
// // MONGODB CONNECTIONS (DUAL)
// // ============================================

// // Connection 1: YOUR DATABASE (Fire Events, Predictions)
// const fireVisionConnection = mongoose.createConnection(process.env.MONGODB_URI);

// fireVisionConnection
//   .on("connected", () =>
//     console.log("✓ Connected to YOUR MongoDB (Fire Events DB)")
//   )
//   .on("error", (err) => console.error("YOUR DB Error:", err));

// // Connection 2: FRIEND'S DATABASE (User Registration)
// const userDatabaseConnection = mongoose.createConnection(
//   process.env.USER_DB_URI
// );

// userDatabaseConnection
//   .on("connected", () =>
//     console.log("✓ Connected to FRIEND'S MongoDB (Users DB)")
//   )
//   .on("error", (err) => console.error("FRIEND'S DB Error:", err));

// // ============================================
// // MONGOOSE SCHEMAS - YOUR DATABASE
// // ============================================

// // Fire Event Schema (Your DB)
// const FireEventSchema = new mongoose.Schema(
//   {
//     source: { type: String, required: true },
//     label: { type: String, required: true },
//     fireProbability: { type: Number, required: true },
//     dangerScore: { type: Number, default: null },
//     cause: { type: String, default: null },
//     confidence: { type: Number, default: null },
//     imageUrl: { type: String, default: null },
//     cloudinaryPublicId: { type: String, default: null },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // Alert Schema (Your DB)
// const AlertSchema = new mongoose.Schema(
//   {
//     source: { type: String, required: true },
//     message: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // ⭐ FIRE DETECTION ALERT SCHEMA (Your DB)
// const FireDetectionAlertSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     userName: { type: String, required: true },
//     userEmail: { type: String, required: true },
//     fireLocation: { type: String, required: true },
//     confidence: { type: Number, required: true },
//     cctvFootage: { type: String, default: "N/A" },
//     imageUrl: { type: String, default: null },
//     status: {
//       type: String,
//       enum: ["sent", "acknowledged", "resolved"],
//       default: "sent",
//     },
//     message: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now },
//     acknowledgedAt: { type: Date, default: null },
//     resolvedAt: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// // ML Prediction Schema (Your DB)
// const MLPredictionSchema = new mongoose.Schema(
//   {
//     ndvi: { type: Number, required: true },
//     brightness: { type: Number, required: true },
//     t31: { type: Number, required: true },
//     confidence: { type: Number, required: true },
//     temperature: { type: Number, required: true },
//     humidity: { type: Number, required: true },
//     windSpeed: { type: Number, required: true },
//     prediction: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // CNN Prediction Schema (Your DB)
// const CNNPredictionSchema = new mongoose.Schema(
//   {
//     source: { type: String, required: true },
//     label: { type: String, required: true },
//     fireProbability: { type: Number, required: true },
//     rawOutput: { type: Number, required: true },
//     imageUrl: { type: String, default: null },
//     cloudinaryPublicId: { type: String, default: null },
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // ============================================
// // MONGOOSE SCHEMA - FRIEND'S DATABASE
// // ============================================

// const UserSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, default: "user" },
//     createdAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // ============================================
// // MODELS - YOUR DATABASE
// // ============================================

// const FireEvent = fireVisionConnection.model("FireEvent", FireEventSchema);
// const Alert = fireVisionConnection.model("Alert", AlertSchema);
// const FireDetectionAlert = fireVisionConnection.model(
//   "FireDetectionAlert",
//   FireDetectionAlertSchema
// );
// const MLPrediction = fireVisionConnection.model(
//   "MLPrediction",
//   MLPredictionSchema
// );
// const CNNPrediction = fireVisionConnection.model(
//   "CNNPrediction",
//   CNNPredictionSchema
// );

// // ============================================
// // MODELS - FRIEND'S DATABASE
// // ============================================

// const User = userDatabaseConnection.model("User", UserSchema);

// // ============================================
// // CLOUDINARY UPLOAD HELPER
// // ============================================

// const uploadToCloudinary = async (base64Image, folder = "fire-events") => {
//   try {
//     const result = await cloudinary.uploader.upload(base64Image, {
//       folder: folder,
//       resource_type: "image",
//       transformation: [
//         { width: 1200, height: 900, crop: "limit" },
//         { quality: "auto:good" },
//       ],
//     });

//     return {
//       url: result.secure_url,
//       publicId: result.public_id,
//     };
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     throw new Error("Failed to upload image");
//   }
// };

// // ============================================
// // ⭐ SOCKET.IO EVENTS - REAL-TIME ALERTS
// // ============================================

// io.on("connection", (socket) => {
//   console.log(`🔌 User connected: ${socket.id}`);

//   // ⭐ User joins alerts room (by userId)
//   socket.on("join-alerts", (userId) => {
//     console.log(`👤 User ${userId} joined alerts room`);
//     socket.join(`alerts-${userId}`);
//     socket.emit("alert-status", { connected: true, userId });
//   });

//   // ⭐ User leaves alerts room
//   socket.on("leave-alerts", (userId) => {
//     console.log(`👤 User ${userId} left alerts room`);
//     socket.leave(`alerts-${userId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ User disconnected: ${socket.id}`);
//   });
// });

// // ============================================
// // GEMINI AI CHAT ROUTE
// // ============================================

// app.post("/api/gemini/chat", async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res
//       .status(400)
//       .json({ success: false, error: "Message is required" });
//   }

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `You are FireVision AI, an expert assistant for fire detection, CCTV monitoring, and emergency response.\n\nUser: ${message}`,
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.6,
//             maxOutputTokens: 9000,
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errText = await response.text();
//       console.error("Gemini Error Response:", errText);
//       return res.status(500).json({
//         success: false,
//         error: "Gemini API error",
//       });
//     }

//     const data = await response.json();
//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "I couldn't generate a response.";

//     res.json({ success: true, reply });
//   } catch (error) {
//     console.error("Gemini API Exception:", error);
//     res.status(500).json({
//       success: false,
//       error: "Gemini API failed",
//     });
//   }
// });

// // ============================================
// // ⭐ FIRE DETECTION ALERT ROUTES
// // ============================================

// // Send fire alert to all users from FRIEND'S DATABASE
// app.post("/api/fire-alerts/send", async (req, res) => {
//   try {
//     const { fireLocation, confidence, cctvFootage, imageBase64 } = req.body;

//     if (!fireLocation || confidence === undefined) {
//       return res.status(400).json({
//         success: false,
//         error: "fireLocation and confidence are required",
//       });
//     }

//     console.log("🚨 FIRE ALERT TRIGGERED!");

//     // Upload image to Cloudinary if provided
//     let imageUrl = null;
//     if (imageBase64) {
//       const uploadResult = await uploadToCloudinary(imageBase64, "fire-alerts");
//       imageUrl = uploadResult.url;
//     }

//     // ⭐ QUERY FRIEND'S DATABASE for users
//     console.log("🔍 Querying FRIEND'S database for registered users...");
//     const users = await User.find().exec();

//     console.log(`✓ Found ${users.length} users in friend's database`);

//     if (users.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "No registered users found in friend's database",
//       });
//     }

//     // ⭐ CREATE ALERTS IN YOUR DATABASE for each user
//     const alerts = users.map((user) => ({
//       userId: user.userId,
//       userName: user.name,
//       userEmail: user.email,
//       fireLocation,
//       confidence,
//       cctvFootage: cctvFootage || "CCTV-001",
//       imageUrl,
//       message: `🚨 FIRE ALERT 🚨\n\nFire detected at: ${fireLocation}\nConfidence: ${(
//         confidence * 100
//       ).toFixed(2)}%\n\nPlease check CCTV footage and take immediate action.`,
//     }));

//     const savedAlerts = await FireDetectionAlert.insertMany(alerts);

//     // ⭐ EMIT REAL-TIME ALERTS via Socket.io
//     console.log("📡 Broadcasting alerts via Socket.io...");
//     users.forEach((user) => {
//       const userAlert = savedAlerts.find((a) => a.userId === user.userId);

//       // Emit to specific user's room
//       io.to(`alerts-${user.userId}`).emit("new-fire-alert", {
//         _id: userAlert._id,
//         userId: user.userId,
//         userName: user.name,
//         userEmail: user.email,
//         fireLocation,
//         confidence,
//         cctvFootage: cctvFootage || "CCTV-001",
//         imageUrl,
//         status: "sent",
//         message: `🚨 FIRE ALERT 🚨\n\nFire detected at: ${fireLocation}\nConfidence: ${(
//           confidence * 100
//         ).toFixed(2)}%\n\nPlease check CCTV footage and take immediate action.`,
//         timestamp: new Date(),
//       });

//       console.log(`📨 Alert sent to ${user.name} (${user.userId})`);
//     });

//     res.json({
//       success: true,
//       message: `Alert sent to ${alerts.length} users from friend's database`,
//       data: {
//         alertCount: savedAlerts.length,
//         timestamp: new Date(),
//         usersNotified: users.map((u) => ({ name: u.name, email: u.email })),
//       },
//     });
//   } catch (error) {
//     console.error("Error sending fire alert:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all alerts for a specific user (from YOUR database)
// app.get("/api/fire-alerts/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const alerts = await FireDetectionAlert.find({ userId })
//       .sort({ timestamp: -1 })
//       .limit(100);

//     res.json({ success: true, data: alerts });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all active fire alerts (from YOUR database)
// app.get("/api/fire-alerts/active", async (req, res) => {
//   try {
//     const alerts = await FireDetectionAlert.find({ status: "sent" })
//       .sort({ timestamp: -1 })
//       .limit(100);

//     res.json({
//       success: true,
//       data: alerts,
//       count: alerts.length,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Acknowledge a fire alert
// app.put("/api/fire-alerts/:alertId/acknowledge", async (req, res) => {
//   try {
//     const { alertId } = req.params;

//     const alert = await FireDetectionAlert.findByIdAndUpdate(
//       alertId,
//       {
//         status: "acknowledged",
//         acknowledgedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         error: "Alert not found",
//       });
//     }

//     // ⭐ Emit status update via Socket.io
//     io.to(`alerts-${alert.userId}`).emit("alert-acknowledged", {
//       alertId: alert._id,
//       status: "acknowledged",
//       acknowledgedAt: alert.acknowledgedAt,
//     });

//     res.json({
//       success: true,
//       data: alert,
//       message: "Alert acknowledged",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Resolve a fire alert
// app.put("/api/fire-alerts/:alertId/resolve", async (req, res) => {
//   try {
//     const { alertId } = req.params;

//     const alert = await FireDetectionAlert.findByIdAndUpdate(
//       alertId,
//       {
//         status: "resolved",
//         resolvedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         error: "Alert not found",
//       });
//     }

//     // ⭐ Emit status update via Socket.io
//     io.to(`alerts-${alert.userId}`).emit("alert-resolved", {
//       alertId: alert._id,
//       status: "resolved",
//       resolvedAt: alert.resolvedAt,
//     });

//     res.json({
//       success: true,
//       data: alert,
//       message: "Alert resolved",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get fire alert statistics
// app.get("/api/fire-alerts/stats", async (req, res) => {
//   try {
//     const totalAlerts = await FireDetectionAlert.countDocuments();
//     const sentAlerts = await FireDetectionAlert.countDocuments({
//       status: "sent",
//     });
//     const acknowledgedAlerts = await FireDetectionAlert.countDocuments({
//       status: "acknowledged",
//     });
//     const resolvedAlerts = await FireDetectionAlert.countDocuments({
//       status: "resolved",
//     });

//     res.json({
//       success: true,
//       data: {
//         total: totalAlerts,
//         sent: sentAlerts,
//         acknowledged: acknowledgedAlerts,
//         resolved: resolvedAlerts,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ============================================
// // FIRE EVENTS ROUTES (existing)
// // ============================================

// app.get("/api/fire-events", async (req, res) => {
//   try {
//     const events = await FireEvent.find().sort({ timestamp: -1 }).limit(100);
//     res.json({ success: true, data: events });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.get("/api/fire-events/:id", async (req, res) => {
//   try {
//     const event = await FireEvent.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({ success: false, error: "Event not found" });
//     }
//     res.json({ success: true, data: event });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/fire-events", async (req, res) => {
//   try {
//     const {
//       source,
//       label,
//       fireProbability,
//       dangerScore,
//       cause,
//       confidence,
//       imageBase64,
//     } = req.body;

//     let imageUrl = null;
//     let cloudinaryPublicId = null;

//     if (imageBase64) {
//       const uploadResult = await uploadToCloudinary(imageBase64, "fire-events");
//       imageUrl = uploadResult.url;
//       cloudinaryPublicId = uploadResult.publicId;
//     }

//     const newEvent = new FireEvent({
//       source: source || "Unknown",
//       label: label || "Unknown",
//       fireProbability: parseFloat(fireProbability) || 0,
//       dangerScore: dangerScore ? parseInt(dangerScore) : null,
//       cause: cause || null,
//       confidence: confidence ? parseInt(confidence) : null,
//       imageUrl,
//       cloudinaryPublicId,
//       timestamp: new Date(),
//     });

//     await newEvent.save();

//     res.status(201).json({
//       success: true,
//       data: {
//         id: newEvent._id,
//         imageUrl: newEvent.imageUrl,
//         message: "Fire event created successfully",
//       },
//     });
//   } catch (error) {
//     console.error("Error creating fire event:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.delete("/api/fire-events/:id", async (req, res) => {
//   try {
//     const event = await FireEvent.findById(req.params.id);

//     if (!event) {
//       return res.status(404).json({ success: false, error: "Event not found" });
//     }

//     if (event.cloudinaryPublicId) {
//       await cloudinary.uploader.destroy(event.cloudinaryPublicId);
//     }

//     await FireEvent.findByIdAndDelete(req.params.id);

//     res.json({ success: true, message: "Event deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.get("/api/fire-events/statistics", async (req, res) => {
//   try {
//     const events = await FireEvent.find();
//     const alerts = await Alert.countDocuments();

//     const stats = {
//       totalFires: 0,
//       totalAlerts: alerts,
//       avgDangerScore: 0,
//       firesBySource: {},
//       firesByCause: {},
//     };

//     let dangerScoreSum = 0;
//     let dangerScoreCount = 0;

//     events.forEach((event) => {
//       if (event.label === "Fire") {
//         stats.totalFires++;
//       }

//       if (event.dangerScore) {
//         dangerScoreSum += event.dangerScore;
//         dangerScoreCount++;
//       }

//       stats.firesBySource[event.source] =
//         (stats.firesBySource[event.source] || 0) + 1;

//       if (event.cause) {
//         stats.firesByCause[event.cause] =
//           (stats.firesByCause[event.cause] || 0) + 1;
//       }
//     });

//     stats.avgDangerScore =
//       dangerScoreCount > 0 ? Math.round(dangerScoreSum / dangerScoreCount) : 0;

//     res.json({ success: true, data: stats });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ============================================
// // ALERTS ROUTES (existing)
// // ============================================

// app.get("/api/alerts", async (req, res) => {
//   try {
//     const alerts = await Alert.find().sort({ timestamp: -1 }).limit(100);
//     res.json({ success: true, data: alerts });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/alerts", async (req, res) => {
//   try {
//     const { source, message } = req.body;

//     if (!source || !message) {
//       return res.status(400).json({
//         success: false,
//         error: "Source and message are required",
//       });
//     }

//     const newAlert = new Alert({ source, message });
//     await newAlert.save();

//     res.status(201).json({
//       success: true,
//       data: { id: newAlert._id, message: "Alert created successfully" },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ============================================
// // ML PREDICTIONS ROUTES
// // ============================================

// app.get("/api/predictions/ml", async (req, res) => {
//   try {
//     const predictions = await MLPrediction.find()
//       .sort({ timestamp: -1 })
//       .limit(100);
//     res.json({ success: true, data: predictions });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/predictions/ml", async (req, res) => {
//   try {
//     const newPrediction = new MLPrediction(req.body);
//     await newPrediction.save();

//     res.status(201).json({
//       success: true,
//       data: {
//         id: newPrediction._id,
//         message: "ML prediction created successfully",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ============================================
// // CNN PREDICTIONS ROUTES
// // ============================================

// app.get("/api/predictions/cnn", async (req, res) => {
//   try {
//     const predictions = await CNNPrediction.find()
//       .sort({ timestamp: -1 })
//       .limit(100);
//     res.json({ success: true, data: predictions });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/predictions/cnn", async (req, res) => {
//   try {
//     const { source, label, fireProbability, rawOutput, imageBase64 } = req.body;

//     let imageUrl = null;
//     let cloudinaryPublicId = null;

//     if (imageBase64) {
//       const uploadResult = await uploadToCloudinary(
//         imageBase64,
//         "cnn-predictions"
//       );
//       imageUrl = uploadResult.url;
//       cloudinaryPublicId = uploadResult.publicId;
//     }

//     const newPrediction = new CNNPrediction({
//       source,
//       label,
//       fireProbability,
//       rawOutput,
//       imageUrl,
//       cloudinaryPublicId,
//     });

//     await newPrediction.save();

//     res.status(201).json({
//       success: true,
//       data: {
//         id: newPrediction._id,
//         message: "CNN prediction created successfully",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ============================================
// // UTILITY ROUTES
// // ============================================

// app.get("/api/health", (req, res) => {
//   const fireVisionReady = fireVisionConnection.readyState === 1;
//   const userDbReady = userDatabaseConnection.readyState === 1;

//   res.json({
//     status: fireVisionReady && userDbReady ? "OK" : "PARTIAL",
//     timestamp: new Date().toISOString(),
//     databases: {
//       fireVision: fireVisionReady ? "connected" : "disconnected",
//       userDatabase: userDbReady ? "connected" : "disconnected",
//     },
//     cloudinary: {
//       configured: !!process.env.CLOUDINARY_CLOUD_NAME,
//     },
//     socketIo: {
//       connected: true,
//       clients: io.engine.clientsCount,
//     },
//   });
// });

// app.get("/", (req, res) => {
//   res.json({
//     message: "FireVision API Server",
//     version: "5.0.0 (Dual MongoDB + Cloudinary + Real-Time Alerts)",
//     databases: {
//       fireVision: "Your MongoDB (Fire Events)",
//       userDatabase: "Friend's MongoDB (User Registration)",
//     },
//     features: [
//       "Fire Detection",
//       "CCTV Monitoring",
//       "Real-Time Alerts",
//       "Dual Database",
//       "Socket.io",
//     ],
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack);
//   res.status(500).json({
//     success: false,
//     error: "Internal server error",
//     message: err.message,
//   });
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Route not found" });
// });

// // Start server
// server.listen(PORT, () => {
//   console.log("\n" + "=".repeat(70));
//   console.log("🔥 FireVision Backend (DUAL MongoDB + Real-Time Alerts)");
//   console.log("=".repeat(70));
//   console.log(`✓ Server: http://localhost:${PORT}`);
//   console.log(
//     `✓ Your Database: MongoDB ${
//       fireVisionConnection.readyState === 1 ? "✓" : "✗"
//     }`
//   );
//   console.log(
//     `✓ Friend's Database: MongoDB ${
//       userDatabaseConnection.readyState === 1 ? "✓" : "✗"
//     }`
//   );
//   console.log(`✓ Images: Cloudinary`);
//   console.log(`✓ Real-Time Alerts: Socket.io ✓`);
//   console.log("=".repeat(70) + "\n");
// });

// module.exports = server;

// ============================================
// backend/server.js - Real-Time Alerts (Socket.io)
// ============================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const http = require("http");
const socketIo = require("socket.io");
const nodemailer = require("nodemailer"); // ⭐ Required

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.set("io", io);
const PORT = process.env.PORT || 5000;

// ============================================
// ⭐ NODEMAILER SETUP (Add this here)
// ============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send the actual email
const sendEmailAlert = async (toEmail, userName, details) => {
  const mailOptions = {
    from: `"FireVision AI Alerts" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🚨 CRITICAL: Fire Detected at ${details.fireLocation}`,
    html: `
      <div style="font-family: sans-serif; border: 2px solid #ff0000; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ff0000;">🔥 FIRE ALERT DETECTED!</h2>
        <p>Hello <b>${userName}</b>,</p>
        <p>Our system has detected a fire with <b>${(details.confidence * 100).toFixed(1)}%</b> confidence.</p>
        <hr />
        <p>📍 <b>Location:</b> ${details.fireLocation}</p>
        <p>⚠️ <b>Message:</b> ${details.message}</p>
        ${details.imageUrl ? `<img src="${details.imageUrl}" alt="CCTV" style="width:100%; border-radius:5px; margin-top:10px;"/>` : ""}
        <hr />
        <p style="font-size: 12px; color: #666;">This is an automated emergency notification from FireVision.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email successfully sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Email failed for ${toEmail}:`, err.message);
  }
};

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
// MONGODB CONNECTIONS (DUAL)
// ============================================

// Connection 1: YOUR DATABASE (Fire Events, Predictions)
const fireVisionConnection = mongoose.createConnection(process.env.MONGODB_URI);

fireVisionConnection
  .on("connected", () =>
    console.log("✓ Connected to YOUR MongoDB (Fire Events DB)"),
  )
  .on("error", (err) => console.error("YOUR DB Error:", err));

// Connection 2: FRIEND'S DATABASE (User Registration)
const userDatabaseConnection = mongoose.createConnection(
  process.env.USER_DB_URI,
);

userDatabaseConnection
  .on("connected", () =>
    console.log("✓ Connected to FRIEND'S MongoDB (Users DB)"),
  )
  .on("error", (err) => console.error("FRIEND'S DB Error:", err));

// ============================================
// MONGOOSE SCHEMAS - YOUR DATABASE
// ============================================

// Fire Event Schema (Your DB)
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
  { timestamps: true },
);

// Alert Schema (Your DB)
const AlertSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ⭐ FIRE DETECTION ALERT SCHEMA (Your DB) - UPDATED
const FireDetectionAlertSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String, default: null },
    fireLocation: { type: String, required: true },
    confidence: { type: Number, required: true },
    cctvFootage: { type: String, default: "N/A" },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["sent", "acknowledged", "resolved"],
      default: "sent",
    },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "critical",
    },
    source: { type: String, default: "CCTV" },
    timestamp: { type: Date, default: Date.now },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

// ML Prediction Schema (Your DB)
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
  { timestamps: true },
);

// CNN Prediction Schema (Your DB)
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
  { timestamps: true },
);

// ============================================
// MONGOOSE SCHEMA - FRIEND'S DATABASE
// ============================================

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ============================================
// MODELS - YOUR DATABASE
// ============================================

const FireEvent = fireVisionConnection.model("FireEvent", FireEventSchema);
const Alert = fireVisionConnection.model("Alert", AlertSchema);
const FireDetectionAlert = fireVisionConnection.model(
  "FireDetectionAlert",
  FireDetectionAlertSchema,
);
const MLPrediction = fireVisionConnection.model(
  "MLPrediction",
  MLPredictionSchema,
);
const CNNPrediction = fireVisionConnection.model(
  "CNNPrediction",
  CNNPredictionSchema,
);

// ============================================
// MODELS - FRIEND'S DATABASE
// ============================================

const User = userDatabaseConnection.model("User", UserSchema);

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
// ⭐ SOCKET.IO EVENTS - REAL-TIME ALERTS
// ============================================

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // ⭐ User joins alerts room (by userId)
  socket.on("join-alerts", (userId) => {
    console.log(`👤 User ${userId} joined alerts room`);
    socket.join(`alerts-${userId}`);
    socket.emit("alert-status", {
      connected: true,
      userId,
      message: "Connected to alerts room",
      timestamp: new Date(),
    });
  });

  // ⭐ User leaves alerts room
  socket.on("leave-alerts", (userId) => {
    console.log(`👤 User ${userId} left alerts room`);
    socket.leave(`alerts-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    console.error(`⚠️ Socket error: ${error}`);
  });
});

// ============================================
// GEMINI AI CHAT ROUTE
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are FireVision AI, an expert assistant for fire detection, CCTV monitoring, and emergency response.\n\nUser: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 9000,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error Response:", errText);
      return res.status(500).json({
        success: false,
        error: "Gemini API error",
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Gemini API Exception:", error);
    res.status(500).json({
      success: false,
      error: "Gemini API failed",
    });
  }
});

// ============================================
// ⭐ FIRE DETECTION ALERT ROUTES (ENHANCED)
// ============================================

// 🚨 BROADCAST FIRE ALERT TO ALL USERS

// ============================================
// ⭐ UPDATED BROADCAST ROUTE (Replace your current /broadcast)
// ============================================
app.post("/api/fire-alerts/broadcast", async (req, res) => {
  try {
    const {
      fireLocation,
      confidence,
      cctvFootage,
      imageBase64,
      message,
      severity = "critical",
      source = "CCTV",
      metadata = {},
    } = req.body;

    if (!fireLocation || confidence === undefined) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }

    // 1. Image Upload
    let imageUrl = null;
    if (imageBase64) {
      const uploadResult = await uploadToCloudinary(imageBase64, "fire-alerts");
      imageUrl = uploadResult.url;
    }

    // 2. Fetch Users from Friend's DB
    const users = await User.find().select("_id name email phone").lean();

    if (users.length === 0) {
      return res.status(400).json({ success: false, error: "No users found" });
    }

    // 3. Create Alerts in Your DB
    const alertMsgText =
      message || `🚨 FIRE ALERT 🚨\nFire detected at: ${fireLocation}`;
    const alertsToCreate = users.map((user) => ({
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || null,
      fireLocation,
      confidence,
      imageUrl,
      status: "sent",
      message: alertMsgText,
      severity,
      source,
    }));

    const savedAlerts = await FireDetectionAlert.insertMany(alertsToCreate);

    // 4. BROADCAST (Socket.io + Email)
    users.forEach((user, index) => {
      // A. Real-time Dashboard update
      io.to(`alerts-${user._id.toString()}`).emit(
        "new-fire-alert",
        savedAlerts[index],
      );

      // B. ⭐ SEND EMAIL (This is where the email triggers)
      if (user.email) {
        sendEmailAlert(user.email, user.name, {
          fireLocation,
          confidence,
          message: alertMsgText,
          imageUrl: imageUrl,
        });
      }
    });

    res.status(201).json({
      success: true,
      message: `Broadcasted to ${users.length} users via Dashboard and Email`,
    });
  } catch (error) {
    console.error("❌ Broadcast error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Send fire alert to all users from FRIEND'S DATABASE (Legacy endpoint)
app.post("/api/fire-alerts/send", async (req, res) => {
  try {
    const { fireLocation, confidence, cctvFootage, imageBase64 } = req.body;

    if (!fireLocation || confidence === undefined) {
      return res.status(400).json({
        success: false,
        error: "fireLocation and confidence are required",
      });
    }

    console.log("🚨 FIRE ALERT TRIGGERED!");

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    if (imageBase64) {
      try {
        const uploadResult = await uploadToCloudinary(
          imageBase64,
          "fire-alerts",
        );
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
      }
    }

    // ⭐ QUERY FRIEND'S DATABASE for users
    console.log("🔍 Querying FRIEND'S database for registered users...");
    const users = await User.find().lean();

    console.log(`✓ Found ${users.length} users in friend's database`);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No registered users found in friend's database",
      });
    }

    // ⭐ CREATE ALERTS IN YOUR DATABASE for each user
    const alerts = users.map((user) => ({
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || null,
      fireLocation,
      confidence,
      cctvFootage: cctvFootage || "CCTV-001",
      imageUrl,
      message: `🚨 FIRE ALERT 🚨\n\nFire detected at: ${fireLocation}\nConfidence: ${(
        confidence * 100
      ).toFixed(2)}%\n\nPlease check CCTV footage and take immediate action.`,
    }));

    const savedAlerts = await FireDetectionAlert.insertMany(alerts);

    // ⭐ EMIT REAL-TIME ALERTS via Socket.io
    console.log("📡 Broadcasting alerts via Socket.io...");
    users.forEach((user, index) => {
      const userAlert = savedAlerts[index];

      // Emit to specific user's room
      io.to(`alerts-${user._id.toString()}`).emit("new-fire-alert", {
        _id: userAlert._id,
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        fireLocation,
        confidence,
        cctvFootage: cctvFootage || "CCTV-001",
        imageUrl,
        status: "sent",
        message: `🚨 FIRE ALERT 🚨\n\nFire detected at: ${fireLocation}\nConfidence: ${(
          confidence * 100
        ).toFixed(2)}%\n\nPlease check CCTV footage and take immediate action.`,
        timestamp: new Date(),
      });

      console.log(`📨 Alert sent to ${user.name} (${user._id})`);
    });

    res.json({
      success: true,
      message: `Alert sent to ${alerts.length} users from friend's database`,
      data: {
        alertCount: savedAlerts.length,
        timestamp: new Date(),
        usersNotified: users.map((u) => ({ name: u.name, email: u.email })),
      },
    });
  } catch (error) {
    console.error("Error sending fire alert:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all alerts for a specific user (from YOUR database)
app.get("/api/fire-alerts/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, skip = 0 } = req.query;

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const alerts = await FireDetectionAlert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await FireDetectionAlert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        returned: alerts.length,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active fire alerts (from YOUR database)
app.get("/api/fire-alerts/active", async (req, res) => {
  try {
    const alerts = await FireDetectionAlert.find({ status: "sent" })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all alerts (admin)
app.get("/api/fire-alerts/all", async (req, res) => {
  try {
    const { status, limit = 100, skip = 0 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const alerts = await FireDetectionAlert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await FireDetectionAlert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        returned: alerts.length,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Acknowledge a fire alert
app.put("/api/fire-alerts/:alertId/acknowledge", async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await FireDetectionAlert.findByIdAndUpdate(
      alertId,
      {
        status: "acknowledged",
        acknowledgedAt: new Date(),
      },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    // ⭐ Emit status update via Socket.io
    const io = req.app.get("io");
    io.to(`alerts-${alert.userId}`).emit("alert-acknowledged", {
      alertId: alert._id,
      userId: alert.userId,
      status: "acknowledged",
      acknowledgedAt: alert.acknowledgedAt,
    });

    console.log(`✅ Alert ${alertId} acknowledged by user ${alert.userId}`);

    res.json({
      success: true,
      data: alert,
      message: "Alert acknowledged",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve a fire alert
app.put("/api/fire-alerts/:alertId/resolve", async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await FireDetectionAlert.findByIdAndUpdate(
      alertId,
      {
        status: "resolved",
        resolvedAt: new Date(),
      },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    // ⭐ Emit status update via Socket.io
    const io = req.app.get("io");
    io.to(`alerts-${alert.userId}`).emit("alert-resolved", {
      alertId: alert._id,
      userId: alert.userId,
      status: "resolved",
      resolvedAt: alert.resolvedAt,
    });

    console.log(`✅ Alert ${alertId} resolved by user ${alert.userId}`);

    res.json({
      success: true,
      data: alert,
      message: "Alert resolved",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get fire alert statistics
app.get("/api/fire-alerts/stats", async (req, res) => {
  try {
    const totalAlerts = await FireDetectionAlert.countDocuments();
    const sentAlerts = await FireDetectionAlert.countDocuments({
      status: "sent",
    });
    const acknowledgedAlerts = await FireDetectionAlert.countDocuments({
      status: "acknowledged",
    });
    const resolvedAlerts = await FireDetectionAlert.countDocuments({
      status: "resolved",
    });

    // Recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await FireDetectionAlert.countDocuments({
      timestamp: { $gte: oneDayAgo },
    });

    res.json({
      success: true,
      data: {
        total: totalAlerts,
        sent: sentAlerts,
        acknowledged: acknowledgedAlerts,
        resolved: resolvedAlerts,
        recent24h: recentAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FIRE EVENTS ROUTES (existing)
// ============================================

app.get("/api/fire-events", async (req, res) => {
  try {
    const events = await FireEvent.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

    let imageUrl = null;
    let cloudinaryPublicId = null;

    if (imageBase64) {
      const uploadResult = await uploadToCloudinary(imageBase64, "fire-events");
      imageUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.publicId;
    }

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

app.delete("/api/fire-events/:id", async (req, res) => {
  try {
    const event = await FireEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(event.cloudinaryPublicId);
    }

    await FireEvent.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
// ALERTS ROUTES (existing)
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
        "cnn-predictions",
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
  const fireVisionReady = fireVisionConnection.readyState === 1;
  const userDbReady = userDatabaseConnection.readyState === 1;

  res.json({
    status: fireVisionReady && userDbReady ? "OK" : "PARTIAL",
    timestamp: new Date().toISOString(),
    databases: {
      fireVision: fireVisionReady ? "connected" : "disconnected",
      userDatabase: userDbReady ? "connected" : "disconnected",
    },
    cloudinary: {
      configured: !!process.env.CLOUDINARY_CLOUD_NAME,
    },
    socketIo: {
      connected: true,
      clients: io.engine.clientsCount,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "FireVision API Server",
    version:
      "5.1.0 (Dual MongoDB + Cloudinary + Real-Time Alerts + Enhanced Broadcasting)",
    databases: {
      fireVision: "Your MongoDB (Fire Events)",
      userDatabase: "Friend's MongoDB (User Registration)",
    },
    features: [
      "Fire Detection",
      "CCTV Monitoring",
      "Real-Time Alerts",
      "Broadcast to All Users",
      "Dual Database",
      "Socket.io",
      "Cloudinary Image Upload",
    ],
    newEndpoints: [
      "POST /api/fire-alerts/broadcast - Broadcast alert to all users",
      "GET /api/fire-alerts/user/:userId - Get user alerts",
      "PUT /api/fire-alerts/:alertId/acknowledge - Acknowledge alert",
      "PUT /api/fire-alerts/:alertId/resolve - Resolve alert",
    ],
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
server.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("FireVision Backend v5.1.0");
  console.log("   (DUAL MongoDB + Real-Time Alerts + Auto Broadcast)");
  console.log("=".repeat(70));
  console.log(`✓ Server: http://localhost:${PORT}`);
  console.log(
    `✓ Your Database: MongoDB ${
      fireVisionConnection.readyState === 1 ? "✓" : "✗"
    }`,
  );
  console.log(
    `✓ Friend's Database: MongoDB ${
      userDatabaseConnection.readyState === 1 ? "✓" : "✗"
    }`,
  );
  console.log(`✓ Images: Cloudinary ✓`);
  console.log(`✓ Real-Time Alerts: Socket.io ✓`);
  console.log(`✓ Broadcast Feature: Enabled ✓`);
  console.log("=".repeat(70));
  console.log("\n Key Features:");
  console.log("  • Dual database setup (yours + friend's)");
  console.log("  • Real-time alert broadcasting via Socket.io");
  console.log("  • Automatic alert creation for all registered users");
  console.log("  • Image upload to Cloudinary");
  console.log("  • Alert acknowledge & resolve tracking");
  console.log("\n📍 Main Broadcast Endpoint:");
  console.log("  POST /api/fire-alerts/broadcast");
  console.log("=".repeat(70) + "\n");
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Real-Time Alerts & Email Broadcast: ENABLED`);
});

module.exports = server;
