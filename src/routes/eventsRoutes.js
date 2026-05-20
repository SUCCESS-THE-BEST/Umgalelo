// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventsController");

router.post("/create", controller.createEvent);
router.get("/:societyId", controller.getEvents);
router.get("/single/:id", controller.getEventById);

module.exports = router;