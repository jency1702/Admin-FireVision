const express = require("express");
const router = express.Router();
const mlPredictionController = require("../controllers/mlPredictionController");

router.get("/ml", mlPredictionController.getAllMLPredictions);
router.post("/ml", mlPredictionController.createMLPrediction);
router.get("/cnn", mlPredictionController.getAllCNNPredictions);
router.post("/cnn", mlPredictionController.createCNNPrediction);

module.exports = router;
