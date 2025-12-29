// backend/routes/fireAlerts.js
const express = require("express");
const fireAlertController = require("../controllers/fireAlertController");

const router = express.Router();

// POST: Send fire alert to all registered users
router.post("/send", fireAlertController.sendFireAlert);

// GET: Fetch all fire alerts
router.get("/all", fireAlertController.getAllAlerts);

// GET: Fetch recent fire alerts (last 50)
router.get("/recent", fireAlertController.getRecentAlerts);

// DELETE: Clear an alert by ID
router.delete("/:id", fireAlertController.deleteAlert);

module.exports = router;
