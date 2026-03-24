const db = require('../config/db');
const createsocieties = async (societyName, monthlyContribution, adminID) => {
  const [response] = await db.execute(
    'INSERT INTO societies (society_name, monthly_contribution, admin_id) VALUES (?, ?, ?)',
    [societyName, monthlyContribution, adminID]
  );
  return response.insertId;
};
const addmembers = async (societyID,userID,role)=>{
  const [response] = await db.execute(
    'INSERT INTO society_members (society_id, user_id, role) VALUES (?, ?, ?)',
    [societyID,userID, role] 
  );
  return response;
}


const findSocietyID = async (societyName) => {
    const [rows] = await db.execute(
        'SELECT society_id FROM societies WHERE society_name = ?',
        [societyName]
    );

    if (rows.length === 0) {
        return null; 
    }

    return rows[0].society_id;
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
const approveRequest = async (userID, societyID) => {
  const [response] = await db.execute(
    'UPDATE join_requests SET status = ? WHERE user_id = ? AND society_id = ?',
    ['approved', userID, societyID]
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

const listJoinedRequests = async (societyID) => {

  const [response] = await db.execute(
    'SELECT * FROM join_requests WHERE society_id = ? AND status = "pending"',
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

const adminSocieties= async(adminID)=>{
  const [response] = await db.execute(
    'SELECT * FROM societies WHERE admin_id = ? ',
    [adminID]
  );

  return response;  
}

module.exports={
    createsocieties,
    findSocietyName,
    joinRequests,
    addmembers,
    getSocietyMembers,
    removeMember,
    listJoinedRequests,
    adminSocieties,
    findSocietyID,
    approveRequest,
}