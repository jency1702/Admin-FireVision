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
});

export const nodeApi = axios.create({
  baseURL: NODE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// CNN prediction (Python)
export const predictFireCNN = async (imageBase64) => {
  const res = await mlApi.post("/predict/cnn", { image: imageBase64 });
  return res.data;
};

// ML fire type (Python)
export const predictFireTypeML = async (features) => {
  const res = await mlApi.post("/predict/ml", features);
  return res.data;
};

export const predictFireCCTV = async (streamUrl, frame = null) => {
  const payload = frame ? { frame } : { streamUrl };
  const response = await mlApi.post("/predict/cctv", payload);
  return response.data;
};

// Save fire event (Node + Cloudinary)
export const saveFireEvent = async (payload) => {
  const res = await nodeApi.post("/api/fire-events", payload);
  return res.data;
};

// Save ML prediction (Node)
export const saveMLPrediction = async (payload) => {
  const res = await nodeApi.post("/api/predictions/ml", payload);
  return res.data;
};

// Save alert (Node)
export const createAlert = async (payload) => {
  const res = await nodeApi.post("/api/alerts", payload);
  return res.data;
};
