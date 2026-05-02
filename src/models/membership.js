const db = require('../config/db');

const addMember = async (user_id, society_id, role, connection = db) => {
  const [result] = await connection.execute(
    `INSERT INTO society_members (user_id, society_id, role)
     VALUES (?, ?, ?)`,
    [user_id, society_id, role]
  );
  return result;
};

const findMember = async (user_id, society_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM society_members 
     WHERE user_id = ? AND society_id = ?`,
    [user_id, society_id]
  );
  return rows[0];
};

const isAdmin = async (user_id, society_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM society_members 
     WHERE user_id = ? AND society_id = ? AND role = 'admin'`,
    [user_id, society_id]
  );
  return rows[0];
};

const displayMembers = async (societyID) => {
  const [response] = await db.execute(
    'SELECT * FROM society_members WHERE society_id = ?',
    [societyID]
  );
  return response;
};

const getMembersBySociety = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        m.role,
        m.joined_at
     FROM society_members m
     JOIN users u ON m.user_id = u.user_id
     WHERE m.society_id = ?`,
    [society_id]
  );

  return rows;
};

module.exports = {
  addMember,
  findMember,
  isAdmin,
  getMembersBySociety
};