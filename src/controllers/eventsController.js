// controllers/eventController.js
const eventModels = require("../models/events");
const notificationModel = require("../models/notifications");
const societyModel = require("../models/society");
const membershipModel = require('../models/membership');

exports.createEvent = async (req, res) => {
    try {

        const result = await eventModels.createEvent(req.body);

        const {
            societyId,
            type,
            title,
            date,
            time,
            location
        } = req.body;

        const userId = req.user.userId;

        const member = await membershipModel.findMember(userId, societyId);

        if (!member || member.role !== 'admin') {
            return res.status(403).json({
                message: 'Only admins can create events'
            });
        }

        const members = await societyModel.getSocietyMembers(societyId);

        const eventType =
            type === 'funeral' ? 'funeral' : 'meeting';

        const message =
            `New ${eventType} added: ${title} on ${date} at ${time}, ${location}`;

        for (const member of members) {
            await notificationModel.createNotification(
                member.user_id,
                societyId,
                message,
                'event_added'
            );
        }

        res.json({
            success: true,
            id: result.insertId,
            message: 'Event added and members notified'
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: err.message
        });
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