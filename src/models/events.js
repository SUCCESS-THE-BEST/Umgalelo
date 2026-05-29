const db = require('../config/db');

const createEvent = async data => {
    const [result] = await db.execute(
        `
        INSERT INTO events 
        (society_id, type, title, date, time, location, member, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.societyId,
            data.type,
            data.title,
            data.date,
            data.time,
            data.location,
            data.member || null,
            data.notes || null
        ]
    );

    return result;
};

const findEventBySocietyId = async societyId => {
    const [rows] = await db.execute(
        `
        SELECT *
        FROM events
        WHERE society_id = ?
        ORDER BY date ASC, time ASC
        `,
        [societyId]
    );

    return rows;
};

const findEventById = async eventId => {
    const [rows] = await db.execute(
        `
        SELECT *
        FROM events
        WHERE id = ?
        `,
        [eventId]
    );

    return rows[0];
};

module.exports = {
    createEvent,
    findEventById,
    findEventBySocietyId
};