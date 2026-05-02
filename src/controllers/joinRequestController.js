const db = require('../config/db');
const societyModel = require('../models/society');
const membershipModel = require('../models/membership');
const joinRequestModel = require('../models/joinRequest');

//join request
const submitRequest = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.body;
    console.log(society_id.society_id)

    const isMember = await membershipModel.findMember(user_id, society_id.society_id);
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    const existing = await joinRequestModel.findExisting(user_id, society_id.society_id);
    if (existing) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    await joinRequestModel.createRequest(user_id, society_id.society_id);

    res.json({ message: 'Join request sent' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get join requests
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


// Approve or Reject Join Request
const handleJoinRequest = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"
  
    try {
        const [request] = await db.query(
            "SELECT * FROM join_requests WHERE request_id = ?",
            [id]
        );

        if (!request.length) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (action === "approve") {
            const insert = await db.query(`
                INSERT INTO society_members (society_id, user_id)
                VALUES (?, ?)
            `, [request[0].society_id, request[0].user_id]);
        }

        const update = await db.query(`
            UPDATE join_requests 
            SET status = ? 
            WHERE request_id = ?
        `, [action === "approve" ? "approved" : "rejected", id]);

        res.json({ message: `Request ${action}d` });

    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    submitRequest,
    getJoinRequests,
    handleJoinRequest
}