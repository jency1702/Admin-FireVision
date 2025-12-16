const { db } = require("../config/firebase");
const admin = require("firebase-admin");

// Get all ML predictions
exports.getAllMLPredictions = async (req, res) => {
  try {
    const snapshot = await db
      .collection("mlPredictions")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const predictions = [];
    snapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: predictions });
  } catch (error) {
    console.error("Error fetching ML predictions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create ML prediction
exports.createMLPrediction = async (req, res) => {
  try {
    const {
      ndvi,
      brightness,
      t31,
      confidence,
      temperature,
      humidity,
      windSpeed,
      prediction,
    } = req.body;

    const predictionRef = await db.collection("mlPredictions").add({
      ndvi: parseFloat(ndvi),
      brightness: parseFloat(brightness),
      t31: parseFloat(t31),
      confidence: parseFloat(confidence),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      windSpeed: parseFloat(windSpeed),
      prediction: prediction || "Unknown",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: predictionRef.id,
        message: "ML prediction created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating ML prediction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all CNN predictions
exports.getAllCNNPredictions = async (req, res) => {
  try {
    const snapshot = await db
      .collection("cnnPredictions")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const predictions = [];
    snapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: predictions });
  } catch (error) {
    console.error("Error fetching CNN predictions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create CNN prediction
exports.createCNNPrediction = async (req, res) => {
  try {
    const { source, label, fireProbability, rawOutput, imageBase64 } = req.body;

    // Upload image if provided (same as fire events)
    let imageUrl = null;
    if (imageBase64) {
      const { bucket } = require("../config/firebase");
      const fileName = `cnn-predictions/${Date.now()}.jpg`;
      const file = bucket.file(fileName);

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

    const predictionRef = await db.collection("cnnPredictions").add({
      source: source || "Unknown",
      label: label || "Unknown",
      fireProbability: parseFloat(fireProbability) || 0,
      rawOutput: parseFloat(rawOutput) || 0,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: predictionRef.id,
        message: "CNN prediction created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating CNN prediction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
