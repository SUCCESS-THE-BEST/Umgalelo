const db = require('../config/db');
const societyModel = require('../models/society');
const membershipModel = require('../models/membership');
const joinRequestModel = require('../models/joinRequest');


//create society page
const createSociety = async (req, res) => {
  try {
    const { societyName, description, monthlyContribution, coverAmount,waitingPeriod,addtionalRules,province,city,maximumMembers,minimumAge } = req.body;
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

    const result = await societyModel.createSociety(societyName, description, monthlyContribution, coverAmount,waitingPeriod,addtionalRules,province,city,maximumMembers,minimumAge, user_id);
    const society_id = result.insertId;

    await membershipModel.addMember(user_id, society_id, 'admin');

    res.status(201).json({ message: 'Society created' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserSocieties = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const societies = await societyModel.getSocietiesByUser(user_id);

    res.json(societies);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//browse page
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


//load society page
const getSocietyDetails = async (req, res) => {

    const { id } = req.params;

    const userId = req.user.userId; // from auth middleware

    try {
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
            SELECT jr.request_id, u.first_name, u.last_name
            FROM join_requests jr
            JOIN users u ON jr.user_id = u.user_id
            WHERE jr.society_id = ? AND jr.status = 'pending'
        `, [id]);

        // 4. Contributions (recent)
        const [contributions] = await db.execute(`
            SELECT c.*, u.first_name, u.last_name
            FROM contributions c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.society_id = ?
            ORDER BY c.payment_date DESC
            LIMIT 10
        `, [id]);

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
          `SELECT IFNULL(SUM(amount), 0) AS total
          FROM contributions c
          WHERE c.society_id = ? AND payment_month = '${new Date().getFullYear()}-0${new Date().getMonth()}'`,
          [id]
        );

        //count claims
        const [total_claims] = await db.execute(
          `SELECT COUNT(*) AS count
          FROM claims
          WHERE society_id = ? AND status = 'approved'`,
          [id]
        );

        res.json({
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


module.exports = {
  createSociety,
  getUserSocieties,
  getAllSocieties,
  getSocietyDetails,
};