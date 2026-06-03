const db = require('../config/db');
const societyModel = require('../models/society');
const membershipModel = require('../models/membership');
const joinRequestModel = require('../models/joinRequest');
const notificationModel = require('../models/notifications');
const userModel = require('../models/user');
const { sendEmail } = require('../services/emailServices');

const getCurrentPaymentMonth = () => {
    const formatter = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        year: 'numeric',
        month: '2-digit'
    });

    const parts = formatter.formatToParts(new Date());

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;

    return `${year}-${month}`;
};

const createSociety = async (req, res) => {
  try {
    const { societyName, description, monthlyContribution, coverAmount,waitingPeriod,additionalRules,province,city,maximumMembers,minimumAge } = req.body;
    const user_id = req.user.userId;

    //remove code if cant add societies, it worked before i added this
    if (societyName === '' || description === '' || monthlyContribution === '' || coverAmount === '' || waitingPeriod === '' || province === '' || city === '' || maximumMembers === '') {
      return res.status(400).json({message: "Fill in all fields with (*)"})
    }

    //add validation
    const exists = await societyModel.findSocietyByName(societyName);
    if (exists.length > 0) {
        return res.status(400).json({message: "society already exists"});
    }

    const result = await societyModel.createSociety(
      societyName, description, monthlyContribution, coverAmount,waitingPeriod,
      additionalRules,province,city,maximumMembers,minimumAge, user_id);
      
    const society_id = result.insertId;

    await membershipModel.addMember(user_id, society_id, 'admin');

    // ================= NOTIFY USER =================
    await notificationModel.createNotification(
        user_id,
        society_id,
        `Your society “${societyName}” has been created successfully. 
        Members can now discover, request to join, and contribute to your society.`,
        'Created'
    );

    const [user] = await userModel.findUserById(user_id);

    await sendEmail(
        user.email,
        'Society Created Successfully - Umgalelo',
        `
            <h2>Society Created Successfully</h2>

            <p>Hi ${user.first_name},</p>

            <p>
                Your society
                <strong>${societyName}</strong>
                has been created successfully on Umgalelo.
            </p>

            <p><strong>Location:</strong> ${city}, ${province}</p>
            <p><strong>Monthly Contribution:</strong> R${monthlyContribution}</p>
            <p><strong>Cover Amount:</strong> R${coverAmount}</p>

            <p>
                You have automatically been assigned as the
                <strong>Society Administrator</strong>.
            </p>

            <p>
                Members can now discover your society, submit join requests,
                and begin contributing.
            </p>

            <br>

            <p>Thank you for using Umgalelo.</p>
        `
    );

    res.status(201).json({ message: 'Society created' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const requestToJoin = async (req, res) => {
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


const getMySocieties = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const societies = await societyModel.getSocietiesByUser(user_id);

    res.json(societies);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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


const approveRequest = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const user_id = req.user.userId;
    const request_id = req.params.id;

    const request = await joinRequestModel.getById(request_id);

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isAdmin = await membershipModel.isAdmin(user_id, request.society_id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admins only' });
    }

    await connection.beginTransaction();

    await membershipModel.addMember(
      request.user_id,
      request.society_id,
      'member',
      connection
    );

    await joinRequestModel.updateStatus(request_id, 'approved', connection);

    await connection.commit();

    res.json({ message: 'User approved' });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};


// Reject request
const rejectRequest = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const request_id = req.params.id;

    const request = await joinRequestModel.getById(request_id);

    if (!request) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isAdmin = await membershipModel.isAdmin(user_id, request.society_id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admins only' });
    }

    await joinRequestModel.updateStatus(request_id, 'rejected');

    res.json({ message: 'Request rejected' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSocietyMembers = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;

    //Check if user belongs to this society
    const isMember = await membershipModel.findMember(user_id, society_id);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const members = await membershipModel.getMembersBySociety(society_id);

    res.json(members);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSocieties = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const { search, province } = req.query;

        const societies = await societyModel.getAllSocieties(
            userId,
            search,
            province,
        );

        res.json(societies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching societies" });
    }
};

const getSocietyDetails = async (req, res) => {

    const { id } = req.params;

    const userId = req.user.userId; // from auth middleware

    try {
        // Logged In user Info
        const user = await userModel.findUserById(userId);

        // 1. Society info
        const [society] = await db.query(`
            SELECT s.*, u.first_name, u.last_name
            FROM societies s
            LEFT JOIN users u ON s.admin_id = u.user_id
            WHERE s.society_id = ?
        `, [id]);

        // 2. Members
        const [members] = await db.query(`
            SELECT u.user_id, u.first_name, u.last_name, m.role, m.joined_at
            FROM society_members m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.society_id = ?
        `, [id]);

        // 3. Pending join requests (admin only)
        const [requests] = await db.query(`
            SELECT jr.request_id, u.first_name, u.last_name, jr.requested_at
            FROM join_requests jr
            JOIN users u ON jr.user_id = u.user_id
            WHERE jr.society_id = ? AND jr.status = 'pending'
        `, [id]);

        // 4. Contributions (recent)
        // Current month
        

        const currentMonth = getCurrentPaymentMonth();


        // Contributions + due members for current month
        const [contributions] = await db.execute(
        `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,

            c.amount,
            c.payment_date,
            c.payment_month,

            CASE
                WHEN c.contribution_id IS NOT NULL
                THEN 'paid'
                ELSE 'due'
            END AS status

        FROM society_members sm

        JOIN users u
            ON sm.user_id = u.user_id

        LEFT JOIN contributions c
            ON c.user_id = sm.user_id
            AND c.society_id = sm.society_id
            AND c.payment_month = ?

        WHERE sm.society_id = ?

        ORDER BY
            status ASC,
            c.payment_date DESC,
            u.first_name ASC
        `,
        [currentMonth, id]);

        // 5. Claims
        const [claims] = await db.execute(`
            SELECT c.*, u.first_name, u.last_name
            FROM claims c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.society_id = ?
            ORDER BY c.claim_date DESC
        `, [id]);

            // Total contributions
        const [total_contributions] = await db.execute(
          `SELECT IFNULL(SUM(amount), 0) AS total
          FROM contributions c
          WHERE c.society_id = ?`,
          [id]
        );

        // Total contributions this month

        const [months_contributions] = await db.execute(
          `
          SELECT IFNULL(SUM(amount), 0) AS total
          FROM contributions c
          WHERE c.society_id = ?
          AND payment_month = ?
          `,
          [id, currentMonth]
        );

        //count claims
        const [total_claims] = await db.execute(
          `SELECT COUNT(*) AS count
          FROM claims
          WHERE society_id = ? AND status = 'approved'`,
          [id]
        );

        res.json({
            user: user[0],
            society: society[0],
            members,
            requests,
            contributions,
            claims,
            total_contributions: total_contributions[0],
            total_claims: total_claims[0],
            months_contributions: months_contributions[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

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
  createSociety,
  requestToJoin,
  getMySocieties,
  getJoinRequests,
  approveRequest,
  rejectRequest,
  getSocietyMembers,
  getAllSocieties,
  getSocietyDetails,
  handleJoinRequest,
};