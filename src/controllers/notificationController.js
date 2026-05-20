const notificationModel = require('../models/notifications');

// ================== GET USER NOTIFICATIONS ===================
const getNotifications = async (req, res) => {
    try {

        const userId = req.user.userId;

        const notifications =
            await notificationModel.getUserNotifications(userId);

        res.json(notifications);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// ====================== MARK AS READ ==========================
const markNotificationRead = async (req, res) => {

    try {

        const user_id = req.user.userId;
        const { id } = req.params;

        await notificationModel.markAsRead(id, user_id);

        res.json({
            message: "Notification marked as read"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead
};