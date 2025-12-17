import axios from "axios";

// Python ML backend
const ML_API_BASE_URL =
  process.env.REACT_APP_ML_API_URL || "http://localhost:5001";

// Node backend
const NODE_API_BASE_URL =
  process.env.REACT_APP_NODE_API_URL || "http://localhost:5000";

export const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const nodeApi = axios.create({
  baseURL: NODE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Add error handlers
mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("ML API Error:", error.response?.data || error.message);
    throw error;
  }
);

nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Node API Error:", error.response?.data || error.message);
    throw error;
  }
);

// ============= ML PREDICTIONS =============

// CNN prediction (Python)
export const predictFireCNN = async (imageBase64) => {
  try {
    const res = await mlApi.post("/predict/cnn", { image: imageBase64 });
    return res.data;
  } catch (error) {
    console.error("CNN Prediction Error:", error);
    throw error;
  }
};

// ML fire type (Python)
export const predictFireTypeML = async (features) => {
  try {
    const res = await mlApi.post("/predict/ml", features);
    return res.data;
  } catch (error) {
    console.error("ML Type Prediction Error:", error);
    throw error;
  }
};

// CCTV prediction (Python)
export const predictFireCCTV = async (streamUrl, frame = null) => {
  try {
    const payload = frame ? { frame } : { streamUrl };
    const response = await mlApi.post("/predict/cctv", payload);
    return response.data;
  } catch (error) {
    console.error("CCTV Prediction Error:", error);
    throw error;
  }
};

// ============= DATABASE OPERATIONS =============

// Save fire event (Node + Cloudinary)
export const saveFireEvent = async (payload) => {
  try {
    const res = await nodeApi.post("/api/fire-events", payload);
    console.log("Fire event saved:", res.data);
    return res.data;
  } catch (error) {
    console.error("Save fire event error:", error);
    throw error;
  }
};

// Get all fire events
export const getFireEventsFromDB = async () => {
  try {
    const res = await nodeApi.get("/api/fire-events");
    return res.data;
  } catch (error) {
    console.error("Get fire events error:", error);
    throw error;
  }
};

// ============= ML PREDICTIONS DB =============

// Save ML prediction (Node)
export const saveMLPrediction = async (payload) => {
  try {
    const res = await nodeApi.post("/api/predictions/ml", payload);
    console.log("ML prediction saved:", res.data);
    return res.data;
  } catch (error) {
    console.error("Save ML prediction error:", error);
    throw error;
  }
};

// Get ML predictions
export const getMLPredictions = async (filters = {}) => {
  try {
    const res = await nodeApi.get("/api/predictions/ml", { params: filters });
    return res.data || { data: [] };
  } catch (error) {
    console.error("Get ML predictions error:", error);
    return { data: [] }; // Return empty array on error
  }
};

// Get ML prediction by ID
export const getMLPredictionById = async (id) => {
  try {
    const res = await nodeApi.get(`/api/predictions/ml/${id}`);
    return res.data;
  } catch (error) {
    console.error("Get ML prediction by ID error:", error);
    throw error;
  }
};

// Get ML prediction stats
export const getMLPredictionStats = async () => {
  try {
    const res = await nodeApi.get("/api/predictions/ml/stats");
    return res.data || {};
  } catch (error) {
    console.error("Get ML prediction stats error:", error);
    return {};
  }
};

// ============= ALERTS =============

// Create alert (Node)
export const createAlert = async (payload) => {
  try {
    const res = await nodeApi.post("/api/alerts", payload);
    console.log("Alert created:", res.data);
    return res.data;
  } catch (error) {
    console.error("Create alert error:", error);
    throw error;
  }
};

// Get all alerts
export const getAlertsFromDB = async (filters = {}) => {
  try {
    const res = await nodeApi.get("/api/alerts", { params: filters });
    return res.data;
  } catch (error) {
    console.error("Get alerts error:", error);
    throw error;
  }
};

// Update alert status
export const updateAlertStatus = async (id, status) => {
  try {
    const res = await nodeApi.patch(`/api/alerts/${id}`, { status });
    return res.data;
  } catch (error) {
    console.error("Update alert status error:", error);
    throw error;
  }
};

// ============= STATISTICS =============

// Get statistics
export const getStatisticsFromDB = async () => {
  try {
    const res = await nodeApi.get("/api/statistics");
    return res.data;
  } catch (error) {
    console.error("Get statistics error:", error);
    throw error;
  }
};

// Get fire count by status
export const getFireCountByStatus = async () => {
  try {
    const res = await nodeApi.get("/api/statistics/fire-count");
    return res.data;
  } catch (error) {
    console.error("Get fire count error:", error);
    throw error;
  }
};

// Get recent events
export const getRecentEvents = async (limit = 10) => {
  try {
    const res = await nodeApi.get(
      `/api/fire-events?limit=${limit}&sort=-timestamp`
    );
    return res.data;
  } catch (error) {
    console.error("Get recent events error:", error);
    throw error;
  }
};

// Get fire event by ID
export const getFireEventById = async (id) => {
  try {
    const res = await nodeApi.get(`/api/fire-events/${id}`);
    return res.data;
  } catch (error) {
    console.error("Get fire event by ID error:", error);
    throw error;
  }
};

// Update fire event
export const updateFireEvent = async (id, payload) => {
  try {
    const res = await nodeApi.put(`/api/fire-events/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update fire event error:", error);
    throw error;
  }
};

// ============= BATCH OPERATIONS =============

// Save multiple predictions
export const saveBatchPredictions = async (predictions) => {
  try {
    const res = await nodeApi.post("/api/predictions/batch", { predictions });
    console.log("Batch predictions saved:", res.data);
    return res.data;
  } catch (error) {
    console.error("Save batch predictions error:", error);
    throw error;
  }
};

// Delete old events (cleanup)
export const deleteOldEvents = async (daysOld = 30) => {
  try {
    const res = await nodeApi.delete(
      `/api/fire-events/cleanup?daysOld=${daysOld}`
    );
    return res.data;
  } catch (error) {
    console.error("Delete old events error:", error);
    throw error;
  }
};

// ============= EXPORT DATA =============

// Export events as CSV
export const exportEventsToCsv = async (filters = {}) => {
  try {
    const res = await nodeApi.get("/api/fire-events/export/csv", {
      params: filters,
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    console.error("Export to CSV error:", error);
    throw error;
  }
};

// Export events as JSON
export const exportEventsToJson = async (filters = {}) => {
  try {
    const res = await nodeApi.get("/api/fire-events/export/json", {
      params: filters,
    });
    return res.data;
  } catch (error) {
    console.error("Export to JSON error:", error);
    throw error;
  }
};

// ============= ALIAS EXPORTS FOR COMPATIBILITY =============

// Alias for getFireEventsFromDB (used in existing code)
export const getFireEvents = async () => {
  try {
    const res = await nodeApi.get("/api/fire-events");
    return res.data || { data: [] };
  } catch (error) {
    console.error("Get fire events error:", error);
    return { data: [] }; // Return empty array on error
  }
};

// Alias for getStatisticsFromDB
export const getStatistics = async () => {
  try {
    const res = await nodeApi.get("/api/statistics");
    return res.data || { data: {} };
  } catch (error) {
    console.error("Get statistics error:", error);
    return { data: {} };
  }
};

// Alias for getAlertsFromDB
export const getAlerts = async () => {
  try {
    const res = await nodeApi.get("/api/alerts");
    return res.data || { data: [] };
  } catch (error) {
    console.error("Get alerts error:", error);
    return { data: [] };
  }
};
