const db = require('../config/db');

//Submit Claims
const SubmitClaim = async (societyId, userId, deceasedName, relationship,  amount) => {
  const [result] = await db.execute(
    'INSERT INTO  claims (user_id, society_id, deceased_name, relationship, claim_amount, status) VALUES (?, ?, ?, ?, ?, "pending")',
    [societyId, userId, deceasedName, relationship, amount]
  );

  return result;
};

//Approve Claims
const ApproveClaim = async (claimId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [claims] = await connection.execute(
      'SELECT * FROM claims WHERE claim_id = ?',
      [claimId]
    );

    const claim = claims[0];

    if (!claim) throw new Error('Claim not found');
    if (claim.status !== 'pending') throw new Error('Already processed');

    const [walletRows] = await connection.execute(
      'SELECT balance FROM society_wallet WHERE society_id = ?',
      [claim.society_id]
    );

    const balance = walletRows[0].balance;

    if (balance < claim.amount) {
      throw new Error('Insufficient funds');
    }

    // 3. Deduct from wallet
    await connection.execute(
      'UPDATE society_wallet SET balance = balance - ? WHERE society_id = ?',
      [claim.amount, claim.society_id]
    );

    // 4. Update claim status
    await connection.execute(
      'UPDATE claims SET status = "approved" WHERE id = ?',
      [claimId]
    );

    // 5. Record transaction
    await connection.execute(
      'INSERT INTO transactions (society_id, type, amount) VALUES (?, "claim", ?)',
      [claim.society_id, claim.amount]
    );

    await connection.commit();

    return { message: 'Claim approved' };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const RejectClaim = async (claimId) => {
  const [result] = await db.execute(
    'UPDATE claims SET status = "rejected" WHERE claim_id = ?',
    [claimId]
  );

  return result;
};

const GetClaimsBySociety = async (societyId) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT 
          c.claim_id,
          c.society_id,
          c.user_id,
          u.name AS user_name,
          c.deceased_name,
          c.relationship,
          c.amount,
          c.status
       FROM claims c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.society_id = ?
       ORDER BY c.claim_id DESC`,
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

module.exports = {
  SubmitClaim,
  ApproveClaim,
  RejectClaim,
  GetClaimsBySociety
};