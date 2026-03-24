const db = require('../config/db');

//Add Contributions
const AddContribution = async (userId, societyId, amount) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [response] = await connection.execute(
      'INSERT INTO contributions (society_id, user_id, amount) VALUES (?, ?, ?)',
      [societyId, userId, amount]
    );

    await connection.execute(
      'UPDATE society_wallet SET balance = balance + ? WHERE society_id = ?',
      [amount, societyId]
    );

    await connection.execute(
      'INSERT INTO transactions (society_id, type, amount) VALUES (?, "contribution", ?)',
      [societyId, amount]
    );

    await connection.commit();

    return response;

  } catch (error) {
    await connection.rollback();
    console.error(error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { 
    AddContribution
};