const db = require('../config/db');

const getCurrentPaymentMonth = () => {
    const formatter = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        year: 'numeric',
        month: '2-digit'
    });

    const parts = formatter.formatToParts(new Date());

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;

    return `${year}-${month}`;
};

const createContribution = async (user_id, society_id, amount, month, connection = db) => {
  const [result] = await connection.execute(
    `INSERT INTO contributions (user_id, society_id, amount, payment_month, status)
     VALUES (?, ?, ?, ?, 'paid')`,
    [user_id, society_id, amount, month]
  );
  return result;
};

const checkMonthlyContributionExists = async (user_id, society_id, month) =>{
  const [result] = await db.execute(
    'SELECT * FROM contributions WHERE user_id = ? AND society_id = ? AND payment_month = ?',
    [user_id, society_id, month]
  )

  return result
}

const UpdateSocietyWallet = async (societyId, amount, connection = db) => {
  const [result] = await connection.execute(
    'UPDATE society_wallet SET balance = balance + ? WHERE society_id = ?',
    [amount, societyId]
  );
  return result;
};

const getUserContributionHistory = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT 
        c.contribution_id,
        c.amount,
        c.payment_date,
        s.society_name AS society_name

     FROM contributions c
     JOIN societies s ON c.society_id = s.society_id
     WHERE c.user_id = ?
     ORDER BY c.payment_date DESC
     LIMIT 5
     `,
    [user_id]
  );

  return rows;
};

const getSocietyPaymentHistory = async (society_id) => {
    const currentMonth = getCurrentPaymentMonth();

    const [rows] = await db.execute(
        `
        -- CURRENT MONTH (all members)
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,

            COALESCE(c.payment_month, ?) AS payment_month,

            c.amount,
            c.payment_date,

            CASE
                WHEN c.status = 'paid' THEN 'paid'
                ELSE 'due'
            END AS status

        FROM society_members sm

        JOIN users u
            ON sm.user_id = u.user_id

        LEFT JOIN contributions c
            ON c.user_id = sm.user_id
            AND c.society_id = sm.society_id
            AND c.payment_month = ?

        WHERE sm.society_id = ?

        UNION ALL

        -- PREVIOUS MONTHS (paid only)
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,

            c.payment_month,
            c.amount,
            c.payment_date,

            'paid' AS status

        FROM contributions c

        JOIN users u
            ON c.user_id = u.user_id

        WHERE c.society_id = ?
        AND c.payment_month <> ?

        ORDER BY payment_month DESC,
                 status ASC,
                 payment_date DESC
        `,
        [
            currentMonth,
            currentMonth,
            society_id,
            society_id,
            currentMonth
        ]
    );

    return rows;
};

const getTotalBySociety = async (society_id) => {
  const [rows] = await db.execute(
    `SELECT IFNULL(SUM(amount), 0) AS total
     FROM contributions WHERE society_id = ?`,
    [society_id]
  );
  return rows[0].total;
};

const getUnpaidMembers = async (society_id, payment_month) => {

    const [rows] = await db.execute(
        `
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            sm.society_id

        FROM society_members sm

        JOIN users u
        ON sm.user_id = u.user_id

        WHERE sm.society_id = ?

        AND sm.user_id NOT IN (

            SELECT c.user_id
            FROM contributions c
            WHERE c.society_id = ?
            AND c.payment_month = ?
            AND c.status = 'paid'

        )
        `,
        [society_id, society_id, payment_month]
    );

    return rows;
};

const getMemberStatement = async (
    user_id,
    society_id
) => {

    const [rows] = await db.execute(
        `
        SELECT
            c.payment_month,
            c.amount,
            c.status,
            c.payment_date,

            s.society_name,

            u.first_name,
            u.last_name

        FROM contributions c

        JOIN societies s
        ON c.society_id = s.society_id

        JOIN users u
        ON c.user_id = u.user_id

        WHERE c.user_id = ?
        AND c.society_id = ?

        ORDER BY c.payment_month DESC
        `,
        [user_id, society_id]
    );

    return rows;
};

module.exports = { 
  createContribution, 
  UpdateSocietyWallet, 
  getUserContributionHistory, 
  getSocietyPaymentHistory, 
  getTotalBySociety,
  checkMonthlyContributionExists,
  getUnpaidMembers,
  getMemberStatement
};