const db = require('../config/db');
const societyModel = require('../models/society')

// ================ PERSONAL DASHBOARD SUMMARY/STATS ============================
const getDashboardSummary = async (req, res) => {
  try {
    const user_id = req.user.userId;

    // Total contributions
    const [contributions] = await db.execute(
      `SELECT IFNULL(SUM(amount), 0) AS total
       FROM contributions
       WHERE user_id = ?`,
      [user_id]
    );

    // Total claims
    const [claims] = await db.execute(
      `SELECT IFNULL(SUM(claim_amount), 0) AS total
       FROM claims
       WHERE user_id = ? AND status = 'approved'`,
      [user_id]
    );

    // Societies count
    const [societies] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM society_members
       WHERE user_id = ?`,
      [user_id]
    );

    const total_contributions = contributions[0].total;
    const total_claims = claims[0].total;
    const balance = total_contributions - total_claims;

    res.json({
      total_contributions,
      total_claims,
      balance,
      societies_count: societies[0].count
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ====================== SOCIETY DASHBOARD SUMMARY/STATS ======================
const getSocietyDashboard = async (req, res) => {
  try {
    const society_id = req.params.id;

    // Total contributions in society
    const [contributions] = await db.execute(
      `SELECT IFNULL(SUM(amount), 0) AS total
       FROM contributions
       WHERE society_id = ?`,
      [society_id]
    );

    // Total claims
    const [claims] = await db.execute(
      `SELECT IFNULL(SUM(claim_amount), 0) AS total
       FROM claims
       WHERE society_id = ? AND status = 'approved'`,
      [society_id]
    );

    // Members count
    const [members] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM society_members
       WHERE society_id = ?`,
      [society_id]
    );

    const total_contributions = contributions[0].total;
    const total_claims = claims[0].total;
    const balance = total_contributions - total_claims;

    res.json({
      total_contributions,
      total_claims,
      balance,
      members_count: members[0].count
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==================== PERSONAL DASHBOARD SOCIETY CARDS =========================
const getUserSocietyCards = async (req, res) => {

    try {

        const user_id = req.user.userId;

        const rows =
            await societyModel.getUserSocietyCards(user_id);

        const formatted = rows.map(s => ({

            id: s.society_id,
            society_name: s.society_name,
            monthly_contribution: s.monthly_contribution,
            role: s.role,
            society_members: s.member_count,

            joined: formatDate(s.joined_at),

            has_paid: !!s.has_paid,

            payment_status:
                s.has_paid ? 'Paid' : 'Due'
        }));

        res.json(formatted);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
};


// helper
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });
};

// ================== GET EVENTS/CALENDER ===================
const getUserEvents = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await db.execute(`
            SELECT 
                e.id,
                e.title,
                e.type,
                e.date,
                e.time,
                e.location,
                s.society_name
            FROM events e
            JOIN societies s ON e.society_id = s.society_id
            JOIN society_members sm ON sm.society_id = s.society_id
            WHERE sm.user_id = ?
            ORDER BY e.date ASC
        `, [userId]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
  getDashboardSummary,
  getSocietyDashboard,
  getUserSocietyCards,
  getUserEvents
};