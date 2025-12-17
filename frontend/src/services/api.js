import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fire Events
export const getFireEvents = async () => {
  const response = await api.get("/fire-events");
  return response.data;
};

export const createFireEvent = async (eventData) => {
  const response = await api.post("/fire-events", eventData);
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get("/api/fire-events/statistics");
  return response.data;
};

// Alerts
export const getAlerts = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await api.post("/alerts", alertData);
  return response.data;
};

// ML/CNN Predictions
export const getMLPredictions = async () => {
  const response = await api.get("/predictions/ml");
  return response.data;
};

export const getCNNPredictions = async () => {
  const response = await api.get("/predictions/cnn");
  return response.data;
};

export default api;
