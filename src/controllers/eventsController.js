// controllers/eventController.js
const eventModels = require("../models/events");

exports.createEvent = async (req, res) => {
    try {
        const result = await eventModels.createEvent(req.body);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await eventModels.findEventBySocietyId(req.params.societyId);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await eventModels.findEventById(req.params.id);
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};