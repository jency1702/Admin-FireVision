// frontend/src/services/mlApi.js
// Service for communicating with Python ML/CNN backend

import axios from "axios";

const ML_API_BASE_URL =
  process.env.REACT_APP_ML_API_URL || "http://localhost:5001";

const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds for ML predictions
});

// Error handler
mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("ML API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Check if ML backend is healthy
 */
export const checkMLHealth = async () => {
  try {
    const response = await mlApi.get("/health");
    return response.data;
  } catch (error) {
    console.error("ML backend health check failed:", error);
    return { status: "unhealthy", error: error.message };
  }
};

/**
 * CNN Fire Detection from Image
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise} Prediction result
 */
export const predictFireCNN = async (imageBase64) => {
  try {
    const response = await mlApi.post("/predict/cnn", {
      image: imageBase64,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "CNN prediction failed");
  }
};

/**
 * ML Fire Type Prediction
 * @param {Object} features - Environmental features
 * @returns {Promise} Fire type prediction
 */
export const predictFireTypeML = async (features) => {
  try {
    const response = await mlApi.post("/predict/ml", {
      ndvi: features.ndvi,
      brightness: features.brightness,
      t31: features.t31,
      confidence: features.confidence,
      temperature: features.temperature,
      humidity: features.humidity,
      windSpeed: features.windSpeed,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "ML prediction failed");
  }
};

/**
 * CCTV Stream Analysis
 * @param {string} streamUrl - CCTV stream URL
 * @param {string} frame - Optional base64 frame
 * @returns {Promise} Fire detection result
 */
export const predictFireCCTV = async (streamUrl, frame = null) => {
  try {
    const payload = frame ? { frame } : { streamUrl };
    const response = await mlApi.post("/predict/cctv", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "CCTV prediction failed");
  }
};

export default mlApi;
