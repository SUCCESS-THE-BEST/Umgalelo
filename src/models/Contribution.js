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

    await connection.execute(
      'UPDATE society_wallet SET balance = balance - ? WHERE society_id = ?',
      [claim.amount, claim.society_id]
    );

    await connection.execute(
      'UPDATE claims SET status = "approved" WHERE id = ?',
      [claimId]
    );

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



module.exports = { 
    AddContribution,
    SubmitClaim,
    ApproveClaim,
    RejectClaim
};
