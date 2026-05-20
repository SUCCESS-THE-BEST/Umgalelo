// models/Event.js
const db = require("../config/db"); // your mysql connection

const createEvent = async (data) => {
    const sql = `
        INSERT INTO events 
        (society_id, type, title, date, time, location, member, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.societyId,
        data.type,
        data.title,
        data.date,
        data.time,
        data.location,
        data.member,
        data.notes
    ];

    const [result] = await db.execute(sql, values);
    return result;
}

const findEventBySocietyId = async (societyId) => {
    const [rows] = await db.execute(
        "SELECT * FROM events WHERE society_id = ? ORDER BY date DESC",
        [societyId]
    );
    return rows;
}

const findEventById = async (eventId) => {
    const [rows] = await db.execute(
            "SELECT * FROM events WHERE id = ?",
            [eventId]
        );
    return rows[0];
}



class Event {
    static async create(data) {
        const sql = `
            INSERT INTO events 
            (society_id, type, title, date, time, location, member, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.societyId,
            data.type,
            data.title,
            data.date,
            data.time,
            data.location,
            data.member,
            data.notes || null
        ];

        const [result] = await db.execute(sql, values);
        return result;
    }

    static async findBySociety(societyId) {
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE society_id = ? ORDER BY date DESC",
            [societyId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE id = ?",
            [id]
        );
        return rows[0];
    }
}


module.exports = {
    createEvent,
    findEventById,
    findEventBySocietyId
};