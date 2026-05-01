const db = require('../config/db');

// creating a society
const createsocieties = async (societyName, monthlyContribution, coverAmount,waitingPeriod,addtionalRules,province,city,maximumMembers,minimumAge,adminID) => {
  const [response] = await db.execute(
    'INSERT INTO societies (society_name, monthly_contribution,cover_amount,waiting_period,additional_rules,province,city,maximum_members,minimum_age,admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [societyName, monthlyContribution,coverAmount,waitingPeriod,addtionalRules,province,city,maximumMembers,minimumAge, adminID]
  );
  return response.insertId;
};

//adding a member to a specific society
const addmembers = async (societyID,userID,role)=>{
  const [response] = await db.execute(
    'INSERT INTO society_members (society_id, user_id, role) VALUES (?, ?, ?)',
    [societyID,userID, role] 
  );
  return response;
}

//getting the society id
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

//getting the society name
const findSocietyName = async (societyName) => {
    const [response] = await db.execute(
        'SELECT * FROM societies WHERE society_name = ?',
        [societyName]
    );
    return response;
};

//creating a join request from a specific society 
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

//list society members 
const displayMembers = async (societyID) => {
  const [response] = await db.execute(
    `SELECT
      sm.member_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      sm.role,
      u.email,
      u.phone,
      c.status
     FROM society_members sm
     JOIN users u ON sm.user_id = u.user_id
     JOIN contributions c ON sm.user_id=c.user_id
     WHERE sm.society_id = ?`,
    [societyID]
  );

  return response;
  console.log(response)
};

// display all request associated with a specific society
const displayRequests = async (societyID) => {

  const [response] = await db.execute(
    `SELECT 
      jr.request_id,
      jr.society_id,
      CONCAT(u.first_name, ' ', u.last_name) AS user_name,
      u.email,
      u.phone,
      jr.status
    FROM join_requests jr
    JOIN users u ON jr.user_id = u.user_id
    WHERE jr.society_id = ? 
      AND jr.status = 'pending'`,
    [societyID]
  );

  return response;
  
};

//remove a member from a specific society 
const removeMember = async (userID, societyID) => {
  const [response] = await db.execute(
    'DELETE FROM society_members WHERE society_id = ? AND user_id = ?',
    [societyID, userID]
  );

  return response;
};

//list of all socities that are under a same admin
const adminSocieties= async(adminID)=>{
  const [response] = await db.execute(
    `SELECT
    sm.society_id,
    s.society_name,
    sm.role
    FROM society_members sm
    JOIN societies s ON sm.society_id=s.society_id
    WHERE sm.user_id=?
    AND sm.role='admin'
    `,
    [adminID]
  );
  console.log(response)
  return response;  

}

//list all user societies such as societies that a user have joined 
const displayUser_societies= async(userID)=>{
  const [response] = await db.execute(
    `SELECT
    sm.society_id,
    s.society_name,
    sm.role
    FROM society_members sm
    JOIN societies s ON sm.society_id=s.society_id
    WHERE sm.user_id=?
    `,
    [userID]
  )
   console.log(response)
  return response;
 
}
module.exports={
    createsocieties,
    findSocietyName,
    joinRequests,
    addmembers,
    displayMembers,
    removeMember,
    displayRequests,
    adminSocieties,
    findSocietyID,
    approveRequest,
    displayUser_societies
}