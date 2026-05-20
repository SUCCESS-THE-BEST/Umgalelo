const db = require('../config/db');
const societyModel = require('../models/society');
const membershipModel = require('../models/membership');
const joinRequestModel = require('../models/joinRequest');
const notificationModel = require('../models/notifications');
const userModel = require('../models/user');

// =========== SUBMIT REQUEST ============
const submitRequest = async (req, res) => {

  try {

    const user_id = req.user.userId;

    const society_id = req.body.society_id;

    const isMember =
      await membershipModel.findMember(
        user_id,
        society_id
      );

    if (isMember) {
      return res.status(400).json({
        message: 'Already a member'
      });
    }

    const existing =
      await joinRequestModel.findExisting(
        user_id,
        society_id
      );

    if (existing) {
      return res.status(400).json({
        message: 'Request already pending'
      });
    }

    // ================= CREATE REQUEST =================
    await joinRequestModel.createRequest(
      user_id,
      society_id
    );

    // ================= GET USER =================
    const user =
      await userModel.findUserById(user_id);

    // ================= GET SOCIETY =================
    const society =
      await societyModel.findSocietyById(
        society_id
      );

    const societyName =
      society[0].society_name;

    const adminId =
      society[0].admin_id;

    // ================= NOTIFY USER =================
    await notificationModel.createNotification(
        user_id,
        society_id,
        `Your request to join ${societyName} has been submitted`,
        'join_request_sent'
    );

    // ================= NOTIFY ADMIN =================
    await notificationModel.createNotification(
        adminId,
        society_id,
        `${user[0].first_name} ${user[0].last_name} requested to join ${societyName}`,
        'join_request_received'
    );

    res.json({
      message: 'Join request sent'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

// ======= FETCH JOIN REQUESTS ==========
const getJoinRequests = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;

    const isAdmin = await membershipModel.isAdmin(user_id, society_id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admins only' });
    }

    const requests = await joinRequestModel.getPendingBySociety(society_id);

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======== APPROVE/REJECT JOIN REQUEST ========
const handleJoinRequest = async (req, res) => {

    const { id } = req.params;

    const { action } = req.body;

    try {

        const [request] = await db.query(
            `
            SELECT *
            FROM join_requests
            WHERE request_id = ?
            `,
            [id]
        );

        if (!request.length) {

            return res.status(404).json({
                message: "Request not found"
            });
        }


        const requestData = request[0];

        // ================= CHECK ADMIN =================
          const user_id = req.user.userId;

          const isAdmin =
            await membershipModel.isAdmin(
              user_id,
              requestData.society_id
            );

          if (!isAdmin) {

              return res.status(403).json({
                  message: 'Admins only'
              });
          }

        const society =
          await societyModel.findSocietyById(
            requestData.society_id
          );

        const societyName =
          society[0].society_name;

        // ================= APPROVE =================
        if (action === "approve") {

            await db.query(
                `
                INSERT INTO society_members
                (society_id, user_id)

                VALUES (?, ?)
                `,
                [
                  requestData.society_id,
                  requestData.user_id
                ]
            );

            // notify user approved
            await notificationModel.createNotification(
                request[0].user_id,
                request[0].society_id,
                `You have been accepted into ${societyName}`,
                'approved'
            );
        }

        // ================= REJECT =================
        if (action === "reject") {

            await notificationModel.createNotification(
                requestData.user_id,
                requestData.society_id,
                `Your request to join ${societyName} was rejected`,
                'rejected'
            );
        }

        // ================= UPDATE STATUS =================
        await db.query(
            `
            UPDATE join_requests
            SET status = ?
            WHERE request_id = ?
            `,
            [
              action === "approve"
                ? "approved"
                : "rejected",
              id
            ]
        );

        res.json({
          message: `Request ${action}d`
        });

    } catch (err) {

        res.status(500).json(err);
    }
};

module.exports = {
    submitRequest,
    getJoinRequests,
    handleJoinRequest
}