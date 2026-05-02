const db = require('../config/db');

const createSociety = async (societyName, description, monthlyContribution, coverAmount,waitingPeriod,addtionalRules,province,city,maximumMembers,minimumAge,adminID) => {
  const [result] = await db.execute(
    `INSERT INTO societies (society_name, description, monthly_contribution,cover_amount,waiting_period,additional_rules,province,city,maximum_members,minimum_age,admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [societyName, description, monthlyContribution,coverAmount,waitingPeriod,addtionalRules || null,province,city,maximumMembers,minimumAge, adminID]
  );
  return result;
};

const findSocietyByName = async (societyName) => {
  const [result] = await db.execute(
    'SELECT * FROM societies WHERE society_name = ?',
    [societyName]
  );
  return result;
};

const findSocietyById = async (societyId) => {
  const [result] = await db.execute(
    'SELECT * FROM societies WHERE society_id = ?',
    [societyId]
  );
  return result;
};

const getSocietiesByUser = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT s.* 
     FROM societies s
     JOIN society_members m ON s.society_id = m.society_id
     WHERE m.user_id = ?`,
    [user_id]
  );
  return rows;
};

const getAllSocieties = async (userId, search = "", province = "") => {

    let query = `
        SELECT 
            s.society_id,
            s.society_name,
            s.description,
            s.city,
            s.province,
            s.monthly_contribution,
            s.cover_amount,
            s.maximum_members,

            COUNT(sm.member_id) AS current_members,

            EXISTS (
                SELECT 1 FROM society_members 
                WHERE user_id = ? AND society_id = s.society_id
            ) AS is_member,

            EXISTS (
                SELECT 1 FROM join_requests 
                WHERE user_id = ? 
                AND society_id = s.society_id 
                AND status = 'pending'
            ) AS requested

        FROM societies s
        LEFT JOIN society_members sm 
            ON s.society_id = sm.society_id
    `;

    const params = [userId, userId];

    // search filter
    if (search) {
        query += ` WHERE s.society_name LIKE ?`;
        params.push(`%${search}%`);
    }

    // province filter
    if (province && province !== "All Provinces") {
        if (search) {
            query += ` AND s.province = ?`;
        } else {
            query += ` WHERE s.province = ?`;
        }
        params.push(province);
    }

    query += ` GROUP BY s.society_id`;

    const [rows] = await db.execute(query, params);
    return rows;
};


module.exports = {
  createSociety,
  findSocietyByName,
  getSocietiesByUser,
  getAllSocieties,
  findSocietyByName,
  findSocietyById
};