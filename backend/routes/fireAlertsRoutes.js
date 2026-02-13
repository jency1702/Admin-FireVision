// // backend/routes/fireAlerts.js
// const express = require("express");
// const fireAlertController = require("../controllers/fireAlertController");

// const router = express.Router();

// // POST: Send fire alert to all registered users
// router.post("/send", fireAlertController.sendFireAlert);

// // GET: Fetch all fire alerts
// router.get("/all", fireAlertController.getAllAlerts);

// // GET: Fetch recent fire alerts (last 50)
// router.get("/recent", fireAlertController.getRecentAlerts);

// // DELETE: Clear an alert by ID
// router.delete("/:id", fireAlertController.deleteAlert);

// module.exports = router;

// fireAlertsRoutes.js - Node.js / Express Backend
// Add this route to your fire-alerts router

// const express = require("express");
// const router = express.Router();
// const Alert = require("../models/Alert"); // Your Alert model
// const User = require("../models/User"); // Your User model
// const io = require("socket.io"); // Socket.io instance

// // ⭐ BROADCAST FIRE ALERT TO ALL USERS
// router.post("/broadcast", async (req, res) => {
//   try {
//     const {
//       fireLocation,
//       cctvFootage,
//       confidence,
//       message,
//       severity = "critical",
//       source = "CCTV",
//     } = req.body;

//     console.log("🚨 Broadcasting fire alert to all users...");

//     // ✅ FETCH ALL REGISTERED USERS
//     const allUsers = await User.find({ isActive: true }, "_id email phone");

//     if (allUsers.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No active users found",
//       });
//     }

//     console.log(`📋 Found ${allUsers.length} active users`);

//     // ✅ CREATE ALERT FOR EACH USER
//     const alertPromises = allUsers.map(async (user) => {
//       try {
//         const newAlert = new Alert({
//           userId: user._id,
//           fireLocation,
//           cctvFootage,
//           confidence,
//           message,
//           severity,
//           source,
//           status: "sent",
//           timestamp: new Date(),
//         });

//         const savedAlert = await newAlert.save();
//         console.log(`✅ Alert created for user ${user._id}`);

//         // 🔔 EMIT TO USER VIA SOCKET.IO (if connected)
//         // Get the socket instance from your app
//         const socket = req.app.get("io"); // or however you store it
//         socket.to(`alerts-${user._id}`).emit("new-fire-alert", savedAlert);

//         return {
//           userId: user._id,
//           success: true,
//           alertId: savedAlert._id,
//         };
//       } catch (error) {
//         console.error(`❌ Error creating alert for user ${user._id}:`, error);
//         return {
//           userId: user._id,
//           success: false,
//           error: error.message,
//         };
//       }
//     });

//     const results = await Promise.all(alertPromises);

//     // 📊 RESPONSE SUMMARY
//     const successCount = results.filter((r) => r.success).length;
//     const failureCount = results.filter((r) => !r.success).length;

//     res.status(201).json({
//       success: true,
//       message: `Alert broadcast to ${successCount} users`,
//       data: {
//         totalUsers: allUsers.length,
//         successCount,
//         failureCount,
//         results,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Broadcast error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error broadcasting alert",
//       error: error.message,
//     });
//   }
// });

// // ⭐ ACKNOWLEDGE ALERT
// router.put("/:alertId/acknowledge", async (req, res) => {
//   try {
//     const { alertId } = req.params;

//     const alert = await Alert.findByIdAndUpdate(
//       alertId,
//       {
//         status: "acknowledged",
//         acknowledgedAt: new Date(),
//       },
//       { new: true },
//     );

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         message: "Alert not found",
//       });
//     }

//     // 🔔 EMIT TO USER VIA SOCKET.IO
//     const socket = req.app.get("io");
//     socket.to(`alerts-${alert.userId}`).emit("alert-acknowledged", {
//       alertId: alert._id,
//       acknowledgedAt: alert.acknowledgedAt,
//     });

//     console.log(`✅ Alert ${alertId} acknowledged`);

//     res.json({
//       success: true,
//       message: "Alert acknowledged",
//       data: alert,
//     });
//   } catch (error) {
//     console.error("❌ Acknowledge error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error acknowledging alert",
//       error: error.message,
//     });
//   }
// });

// // ⭐ RESOLVE ALERT
// router.put("/:alertId/resolve", async (req, res) => {
//   try {
//     const { alertId } = req.params;

//     const alert = await Alert.findByIdAndUpdate(
//       alertId,
//       {
//         status: "resolved",
//         resolvedAt: new Date(),
//       },
//       { new: true },
//     );

//     if (!alert) {
//       return res.status(404).json({
//         success: false,
//         message: "Alert not found",
//       });
//     }

//     // 🔔 EMIT TO USER VIA SOCKET.IO
//     const socket = req.app.get("io");
//     socket.to(`alerts-${alert.userId}`).emit("alert-resolved", {
//       alertId: alert._id,
//       resolvedAt: alert.resolvedAt,
//     });

//     console.log(`✅ Alert ${alertId} resolved`);

//     res.json({
//       success: true,
//       message: "Alert resolved",
//       data: alert,
//     });
//   } catch (error) {
//     console.error("❌ Resolve error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error resolving alert",
//       error: error.message,
//     });
//   }
// });

// // ⭐ GET USER ALERTS
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { status, limit = 50, skip = 0 } = req.query;

//     let query = { userId };
//     if (status) {
//       query.status = status;
//     }

//     const alerts = await Alert.find(query)
//       .sort({ timestamp: -1 })
//       .limit(parseInt(limit))
//       .skip(parseInt(skip));

//     const total = await Alert.countDocuments(query);

//     res.json({
//       success: true,
//       data: alerts,
//       pagination: {
//         total,
//         returned: alerts.length,
//         limit: parseInt(limit),
//         skip: parseInt(skip),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Fetch alerts error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching alerts",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

// fireAlertsRoutes.js - Node.js / Express Backend
// Add this route to your fire-alerts router

const express = require("express");
const router = express.Router();
const axios = require("axios"); // Required for Telegram API calls
const Alert = require("../models/Alert");
const User = require("../models/User");

// 🛠️ CONFIGURATION (Use .env in production)
const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";

/**
 * Helper: Send Telegram Alert
 * This acts as your "Free SMS" replacement.
 */
const sendTelegramAlert = async (chatId, message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
    console.log(`📡 Telegram alert sent to ${chatId}`);
  } catch (err) {
    console.error("❌ Telegram API Error:", err.response?.data || err.message);
  }
};

// ⭐ BROADCAST FIRE ALERT TO ALL USERS
router.post("/broadcast", async (req, res) => {
  try {
    const {
      fireLocation,
      cctvFootage,
      confidence,
      message,
      severity = "critical",
      source = "CCTV",
    } = req.body;

    console.log("🚨 Initiating Broadcast Sequence...");

    // 1. Fetch All Active Users
    const allUsers = await User.find({ isActive: true });

    if (allUsers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No active users found" });
    }

    // 2. Process Alerts in Parallel
    const results = await Promise.all(
      allUsers.map(async (user) => {
        try {
          // A. Save to MongoDB
          const newAlert = new Alert({
            userId: user._id,
            fireLocation,
            cctvFootage,
            confidence,
            message,
            severity,
            source,
            status: "sent",
            timestamp: new Date(),
          });
          const savedAlert = await newAlert.save();

          // B. Emit via Socket.io (Instant Web Update)
          const io = req.app.get("io");
          if (io) {
            io.to(`alerts-${user._id}`).emit("new-fire-alert", savedAlert);
          }

          // C. Send Telegram (Free SMS Alternative)
          // Ensure your User model has a telegramChatId field!
          if (user.telegramChatId) {
            const telegramMsg = `🔥 *FIRE ALERT DETECTED*\n\n📍 *Location:* ${fireLocation}\n📈 *Confidence:* ${(confidence * 100).toFixed(1)}%\n⚠️ *Action:* ${message}`;
            sendTelegramAlert(user.telegramChatId, telegramMsg);
          }

          return { userId: user._id, success: true };
        } catch (err) {
          console.error(`Error for user ${user._id}:`, err);
          return { userId: user._id, success: false };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;

    res.status(201).json({
      success: true,
      message: `Broadcast complete: ${successCount} users notified.`,
      data: { total: allUsers.length, successCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ ACKNOWLEDGE ALERT
router.put("/:alertId/acknowledge", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { status: "acknowledged", acknowledgedAt: new Date() },
      { new: true },
    );
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    const io = req.app.get("io");
    io.to(`alerts-${alert.userId}`).emit("alert-acknowledged", {
      alertId: alert._id,
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ RESOLVE ALERT
router.put("/:alertId/resolve", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { status: "resolved", resolvedAt: new Date() },
      { new: true },
    );
    if (!alert)
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });

    const io = req.app.get("io");
    io.to(`alerts-${alert.userId}`).emit("alert-resolved", {
      alertId: alert._id,
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ GET USER ALERTS
router.get("/user/:userId", async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    let query = { userId: req.params.userId };
    if (status) query.status = status;

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
