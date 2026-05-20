const db = require('../config/db');

const createClaim = async (user_id, society_id, deceased_name, relationship, claim_amount, date_of_passing) => {
  const [result] = await db.execute(
    `INSERT INTO claims (user_id, society_id, deceased_name, relationship, claim_amount, date_of_death)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, society_id, deceased_name, relationship, claim_amount, date_of_passing]
  );
  return result;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT * FROM claims WHERE claim_id = ?`,
    [id]
  );
  return rows[0]; // return single claim
};

const getPendingClaims = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT c.*, u.first_name, u.last_name
     FROM claims c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.society_id = ? AND c.status = 'pending'`,
    [society_id]
  );
  return rows;
};

const updateStatus = async (claim_id, status, connection = db) => {
  const [result] = await connection.execute(
    `UPDATE claims SET status = ? WHERE claim_id = ?`,
    [status, claim_id]
  );
  return result;
};

const getTotalClaims = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT IFNULL(SUM(amount), 0) AS total
     FROM claims WHERE society_id = ? AND status = 'approved'`,
    [society_id]
  );
  return rows[0].total;
};

const getClaims = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT 
        c.claim_id,
        c.claim_amount,
        c.relationship,
        c.status,
        c.date_of_death,
        c.claim_date,
        u.first_name,
        u.last_name

     FROM claims c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.society_id = ?
     ORDER BY c.claim_date DESC`,
    [society_id]
  );

  return rows;
};


const getClaimsSummary = async (society_id) => {

  // total claims paid
  const [paidClaims] = await db.execute(
    `SELECT COUNT(*) AS total_paid
     FROM claims
     WHERE society_id = ?
     AND status = 'paid'`,
    [society_id]
  );

  // total amount paid
  const [amountPaid] = await db.execute(
    `SELECT IFNULL(SUM(claim_amount), 0) AS total_amount
     FROM claims
     WHERE society_id = ?
     AND status = 'paid'`,
    [society_id]
  );

  // pending claims
  const [pendingClaims] = await db.execute(
    `SELECT COUNT(*) AS pending
     FROM claims
     WHERE society_id = ?
     AND status = 'pending'`,
    [society_id]
  );

  // wallet balance
  // const [wallet] = await db.execute(
  //   `SELECT balance
  //    FROM society_wallet
  //    WHERE society_id = ?`,
  //   [society_id]
  // );

  return {
    total_paid: paidClaims[0].total_paid || 0,
    total_amount: amountPaid[0].total_amount || 0,
    pending: pendingClaims[0].pending || 0,
    // wallet_balance: wallet[0]?.balance || 0
  };
};


module.exports = {
  createClaim,
  getById,
  getPendingClaims,
  updateStatus,
  getTotalClaims,
  getClaims,
  getClaimsSummary
};