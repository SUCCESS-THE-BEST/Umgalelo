const db = require('../config/db');

const createsocieties = async (societyName, monthlyContribution, adminID) => {
  const [response] = await db.execute(
    'INSERT INTO societies (society_name, monthly_contribution, admin_id) VALUES (?, ?, ?)',
    [societyName, monthlyContribution, adminID]
  );
//adds admin in society_members table
  const newSocietyId = response.insertId;
  await db.execute(
    'INSERT INTO society_members (society_id, user_id, role) VALUES (?, ?, ?)',
    [newSocietyId, adminID, 'admin'] 
  );

  return response;
};

const findAdminID = async (adminID) => {
    const [response] = await db.execute(
        'SELECT * FROM societies WHERE admin_id = ?',
        [adminID]
    );

    return response;
};

const findSocietyName = async (societyName) => {
    const [response] = await db.execute(
        'SELECT * FROM societies WHERE society_name = ?',
        [societyName]
    );

    return response;
};

const joinRequests= async (userID,societyID)=>{
    const [response] = await db.execute(
        'INSERT INTO join_requests (user_id,society_id,status) VALUES (?,?,?)',
        [userID,societyID,'pending']
    );
    return response;
};
//Add user to society_members
const addmembers = async (userID, societyID) => {
  const [response] = await db.execute(
    'UPDATE join_requests SET status = ? WHERE user_id = ? AND society_id = ?',
    ['approved', userID, societyID]
  );

  await db.execute(
    'INSERT IGNORE INTO society_members (society_id, user_id, role) VALUES (?, ?, ?)',
    [societyID, userID, 'member']
  );

  return response;
};
//list members 
const getSocietyMembers = async (societyID) => {
  const [response] = await db.execute(
    'SELECT * FROM society_members WHERE society_id = ?',
    [societyID]
  );

  return response;
};

//remove member
const removeMember = async (userID, societyID) => {
  const [response] = await db.execute(
    'DELETE FROM society_members WHERE society_id = ? AND user_id = ?',
    [societyID, userID]
  );

  return response;
};


module.exports={
    createsocieties,
    findAdminID,
    findSocietyName,
    joinRequests,
    addmembers,
    getSocietyMembers,
    removeMember
}