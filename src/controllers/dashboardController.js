const db = require('../config/db');

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

const getUserSocietyCards = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const [rows] = await db.execute(`SELECT 
    s.society_id,
    s.society_name,
    s.monthly_contribution,
    sm.role,
    sm.joined_at,

    (SELECT COUNT(*) 
     FROM society_members sm2 
     WHERE sm2.society_id = s.society_id) AS member_count,

    EXISTS (
        SELECT 1
        FROM contributions c
        WHERE c.user_id = sm.user_id
        AND c.society_id = s.society_id
        AND c.status = 'paid'
    ) AS has_paid

FROM societies s
JOIN society_members sm 
    ON s.society_id = sm.society_id

WHERE sm.user_id = ?;`
, [user_id, user_id]);

    //Format response for frontend
    const formatted = rows.map(s => ({
      id: s.society_id,
      society_name: s.society_name,
      monthly_contribution: s.monthly_contribution,
      role: s.role,
      society_members: s.member_count,

      joined: formatDate(s.joined_at),

      has_paid: !!s.has_paid,
      payment_status: s.has_paid ? 'Paid' : 'Due'
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = {
  getDashboardSummary,
  getSocietyDashboard,
  getUserSocietyCards
};