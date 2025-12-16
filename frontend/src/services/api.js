import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token here if you implement authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// Fire Events API
// ============================================
export const getFireEvents = async () => {
  try {
    const response = await api.get("/fire-events");
    return response.data;
  } catch (error) {
    console.error("Error fetching fire events:", error);
    return { success: false, data: [] };
  }
};

export const createFireEvent = async (eventData) => {
  try {
    const response = await api.post("/fire-events", eventData);
    return response.data;
  } catch (error) {
    console.error("Error creating fire event:", error);
    throw error;
  }
};

export const getFireEventById = async (id) => {
  try {
    const response = await api.get(`/fire-events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fire event:", error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await api.get("/fire-events/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      success: false,
      data: {
        totalFires: 0,
        totalAlerts: 0,
        avgDangerScore: 0,
        firesBySource: {},
        firesByCause: {},
      },
    };
  }
};

// ============================================
// Alerts API
// ============================================
export const getAlerts = async () => {
  try {
    const response = await api.get("/alerts");
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return { success: false, data: [] };
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await api.post("/alerts", alertData);
    return response.data;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

// ============================================
// ML Predictions API
// ============================================
export const getMLPredictions = async () => {
  try {
    const response = await api.get("/predictions/ml");
    return response.data;
  } catch (error) {
    console.error("Error fetching ML predictions:", error);
    return { success: false, data: [] };
  }
};

export const createMLPrediction = async (predictionData) => {
  try {
    const response = await api.post("/predictions/ml", predictionData);
    return response.data;
  } catch (error) {
    console.error("Error creating ML prediction:", error);
    throw error;
  }
};

// ============================================
// CNN Predictions API
// ============================================
export const getCNNPredictions = async () => {
  try {
    const response = await api.get("/predictions/cnn");
    return response.data;
  } catch (error) {
    console.error("Error fetching CNN predictions:", error);
    return { success: false, data: [] };
  }
};

export const createCNNPrediction = async (predictionData) => {
  try {
    const response = await api.post("/predictions/cnn", predictionData);
    return response.data;
  } catch (error) {
    console.error("Error creating CNN prediction:", error);
    throw error;
  }
};

export default api;
