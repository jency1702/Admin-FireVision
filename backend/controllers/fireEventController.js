const { db, bucket } = require("../config/firebase");
const admin = require("firebase-admin");

// Get all fire events
exports.getAllFireEvents = async (req, res) => {
  try {
    const snapshot = await db
      .collection("fireEvents")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching fire events:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get fire event by ID
exports.getFireEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("fireEvents").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching fire event:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create fire event
exports.createFireEvent = async (req, res) => {
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

    // Upload image to Firebase Storage if provided
    let imageUrl = null;
    if (imageBase64) {
      const fileName = `fire-events/${Date.now()}.jpg`;
      const file = bucket.file(fileName);

      // Handle base64 string
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const buffer = Buffer.from(base64Data, "base64");

      await file.save(buffer, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            firebaseStorageDownloadTokens: Date.now(),
          },
        },
        public: true,
      });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // Create document
    const eventRef = await db.collection("fireEvents").add({
      source: source || "Unknown",
      label: label || "Unknown",
      fireProbability: parseFloat(fireProbability) || 0,
      dangerScore: dangerScore ? parseInt(dangerScore) : null,
      cause: cause || null,
      confidence: confidence ? parseInt(confidence) : null,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: eventRef.id,
        message: "Fire event created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating fire event:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get fire statistics
exports.getStatistics = async (req, res) => {
  try {
    const snapshot = await db.collection("fireEvents").get();

    const stats = {
      totalFires: 0,
      totalAlerts: 0,
      avgDangerScore: 0,
      firesBySource: {},
      firesByCause: {},
    };

    let dangerScoreSum = 0;
    let dangerScoreCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.label === "Fire") {
        stats.totalFires++;
      }

      if (data.dangerScore) {
        dangerScoreSum += data.dangerScore;
        dangerScoreCount++;
      }

      // Count by source
      stats.firesBySource[data.source] =
        (stats.firesBySource[data.source] || 0) + 1;

      // Count by cause
      if (data.cause) {
        stats.firesByCause[data.cause] =
          (stats.firesByCause[data.cause] || 0) + 1;
      }
    });

    stats.avgDangerScore =
      dangerScoreCount > 0 ? Math.round(dangerScoreSum / dangerScoreCount) : 0;

    // Get alert count
    const alertsSnapshot = await db.collection("alerts").get();
    stats.totalAlerts = alertsSnapshot.size;

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
