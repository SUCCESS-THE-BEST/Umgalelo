const db = require('../config/db');

const saveMessage = async (societyId,senderId,message) => {

    const [res] = await db.execute(
        `INSERT INTO Messages (society_id,sender_id,message_text) 
        VALUES ( ?, ?, ? )`,
        [societyId, senderId, message]
    )
    return res;
};

const getMessagesBySociety = async (societyId) => {

    const [res] = await db.execute(
        `SELECT
            m.message_id,
            m.society_id,
            m.sender_id,
            m.message_text,
            m.created_at,
            u.first_name,
            u.last_name
        FROM Messages m
        JOIN users u
            ON m.sender_id = u.user_id
        WHERE m.society_id = ?
        ORDER BY m.created_at ASC`,
        [societyId]
    );

    return res;
};

module.exports = {
    saveMessage,
    getMessagesBySociety
};