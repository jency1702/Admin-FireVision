const { db } = require("../config/firebase");
const admin = require("firebase-admin");

// Get all alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const snapshot = await db
      .collection("alerts")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const alerts = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create alert
exports.createAlert = async (req, res) => {
  try {
    const { source, message } = req.body;

    if (!source || !message) {
      return res.status(400).json({
        success: false,
        error: "Source and message are required",
      });
    }

    const alertRef = await db.collection("alerts").add({
      source,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: alertRef.id,
        message: "Alert created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
