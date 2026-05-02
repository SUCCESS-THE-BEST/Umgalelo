const db = require('../config/db');

const createRequest = async (user_id, society_id) => {
  const [result] = await db.execute(
    `INSERT INTO join_requests (user_id, society_id)
     VALUES (?, ?)`,
    [user_id, society_id]
  );
  return result;
};

const findExisting = async (user_id, society_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM join_requests 
     WHERE user_id = ? AND society_id = ? AND status = 'pending'`,
    [user_id, society_id]
  );
  return rows[0];
};

const getPendingBySociety = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT jr.*, u.first_name, u.last_name, u.email
     FROM join_requests jr
     JOIN users u ON jr.user_id = u.user_id
     WHERE jr.society_id = ? AND jr.status = 'pending'`,
    [society_id]
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT * FROM join_requests WHERE request_id = ?`,
    [id]
  );
  return rows[0];
};

const updateStatus = async (id, status, connection = db) => {
  const [result] = await connection.execute(
    `UPDATE join_requests SET status = ? WHERE request_id = ?`,
    [status, id]
  );
  return result;
};

module.exports = {
  createRequest,
  findExisting,
  getPendingBySociety,
  getById,
  updateStatus
};