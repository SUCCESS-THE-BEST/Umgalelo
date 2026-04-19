const db = require('../config/db');

//Add Contributions
const AddContribution = async (userId, societyId, amount, connection) => {
  const [response] = await connection.execute(
    'INSERT INTO contributions (society_id, user_id, amount) VALUES (?, ?, ?)',
    [societyId, userId, amount]
  );

  return response;
};

const UpdateSocietyWallet = async (societyId, amount, connection) => {
  await connection.execute(
    `INSERT INTO society_wallet (society_id, balance)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE balance = balance + ?`,
    [societyId, amount, amount]
  );
}

const CreateTransaction = async (societyId, userID,amount, connection) => {
  await connection.execute(
    'INSERT INTO transactions (society_id, user_id ,type, amount) VALUES (?,?, "contribution", ?)',
    [societyId,userID, amount]
  );
};

const processContribution = async (userId, societyId, amount) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await AddContribution(userId, societyId, amount, connection);
    await UpdateSocietyWallet(societyId, amount, connection);
    await CreateTransaction(societyId, amount, connection);

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const GetContributionsBySociety = async (societyId) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT * FROM contributions WHERE society_id = ? ORDER BY contribution_id DESC`,
      [societyId]
    );

    return rows;

  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    connection.release();
  }
};

const GetContributionsByUser = async (userId) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT * FROM contributions WHERE user_id = ? ORDER BY contribution_id DESC`,
      [userId]
    );

    return rows;

  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    connection.release();
  }
};

const GetSocietyWallet = async (societyId) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT balance FROM society_wallet WHERE society_id = ?`,
      [societyId]
    );

    if (rows.length === 0) {
      throw new Error('Society wallet not found');
    }

    return rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { 
  AddContribution,
  UpdateSocietyWallet,
  CreateTransaction,
  processContribution,
  GetContributionsBySociety,
  GetContributionsByUser,
  GetSocietyWallet
};