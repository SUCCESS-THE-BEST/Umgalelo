const db = require('../config/db')


// ============== CREATE NOTIFICATION ================
const createNotification = async (user_id, society_id, message, type = 'general') => {

    const [result] = await db.execute(
        `
        INSERT INTO notifications (user_id, society_id, message, type, expires_at)
        VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 DAY))
        `,
        [user_id, society_id ||null, message, type]
    );

    return result;
};

// ================= GET USER NOTIFICATIONS =================
const getUserNotifications = async (userId) => {

    const [rows] = await db.execute(`
        SELECT
            n.notification_id,
            n.message,
            n.created_at,
            n.is_read,
            n.type,
            s.society_name,
            s.society_id
        FROM notifications n
        LEFT JOIN societies s ON s.society_id = n.society_id
        WHERE n.user_id = ?
        AND n.expires_at > NOW()
        ORDER BY n.created_at DESC
        LIMIT 10
    `, [userId]);

    return rows;
};

// =================== MARK NOTIFICATION AS READ =======================
const markAsRead = async (notification_id, user_id) => {

    const [result] = await db.execute(
        `UPDATE notifications
         SET is_read = true,
             read_at = NOW()
         WHERE notification_id = ?
         AND user_id = ?`,
        [notification_id, user_id]
    );

    return result;
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead
};