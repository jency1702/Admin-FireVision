const express = require("express");
const router = express.Router();
const fireEventController = require("../controllers/fireEventController");

router.get("/", fireEventController.getAllFireEvents);
router.get("/statistics", fireEventController.getStatistics);
router.get("/:id", fireEventController.getFireEventById);
router.post("/", fireEventController.createFireEvent);

module.exports = router;
