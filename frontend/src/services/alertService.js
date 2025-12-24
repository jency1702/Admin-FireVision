// services/alertService.js

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Get all alerts for a specific user
export const getUserAlerts = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user alerts:", error);
    throw error;
  }
};

// Get all active alerts (status: 'sent')
export const getActiveAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/active`);
    if (!response.ok) throw new Error("Failed to fetch active alerts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    throw error;
  }
};

// Acknowledge an alert
export const acknowledgeAlert = async (alertId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/alerts/${alertId}/acknowledge`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to acknowledge alert");
    return await response.json();
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    throw error;
  }
};

// Resolve an alert
export const resolveAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to resolve alert");
    return await response.json();
  } catch (error) {
    console.error("Error resolving alert:", error);
    throw error;
  }
};

// Get alert statistics
export const getAlertStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/stats`);
    if (!response.ok) throw new Error("Failed to fetch alert stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching alert stats:", error);
    throw error;
  }
};
