//database queries
const db = require('../config/db');

// const createUser = async (firstName, lastName, email, phone, idNumber, password) => {
//     const [response] = await db.execute(
//         'INSERT INTO users (first_name, last_name, email, phone, id_number, password) VALUES (?, ?, ?, ?, ?, ?)',
//         [firstName, lastName, email, phone, idNumber, password]
//     );
//     return response;
// };

const createUser = async (firstName, lastName, email, phone, idNumber, password, token) => {
    const [response] = await db.execute(
        'INSERT INTO users (first_name, last_name, email, phone, id_number, password, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, idNumber, password, token]
    );
    return response;
};

const findUserByEmail = async (email) => {
    const [response] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    return response;
};

const findByVerificationToken = async (token) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE verification_token = ?',
    [token]
  );
  return rows;
};

const markUserAsVerified = async (token) => {
  await db.execute(
    'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = ?',
    [token]
  );
};


const findUserById = async (userId) => {
    const [response] = await db.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
    );

    return response;
};

const updateProfile = async (userId, addressLine1, city, province, postalCode, nextOfKinName, nextOfKinPhone) => {
    const [response] = await db.execute(
        'UPDATE users SET address_line1 = ?, city = ?, province = ?, postal_code = ?, next_of_kin_name = ?, next_of_kin_phone = ? WHERE user_id = ?',
        [addressLine1 || null, city || null, province || null, postalCode || null, nextOfKinName || null, nextOfKinPhone || null, userId]
    );

    return response;
}

const setResetToken = async (email, token, expiry) => {

    const [result] = await db.execute(
        `
        UPDATE users
        SET reset_token = ?,
            reset_token_expires = ?
        WHERE email = ?
        `,
        [token, expiry, email]
    );

    return result;
};

const findByResetToken = async (token) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM users
        WHERE reset_token = ?
        AND reset_token_expires > NOW()
        `,
        [token]
    );

    return rows;
};

const updatePassword = async (userId, password) => {

    const [result] = await db.execute(
        `
        UPDATE users
        SET password = ?,
            reset_token = NULL,
            reset_token_expires = NULL
        WHERE user_id = ?
        `,
        [password, userId]
    );

    return result;
};

const updateUserDocuments = async (
    userId,
    profilePhoto = null,
    idDocument = null,
    bankingProof = null
) => {
    const [result] = await db.execute(
        `
        UPDATE users
        SET
            profile_photo = COALESCE(?, profile_photo),
            id_document = COALESCE(?, id_document),
            banking_proof = COALESCE(?, banking_proof)
        WHERE user_id = ?
        `,
        [
            profilePhoto ?? null,
            idDocument ?? null,
            bankingProof ?? null,
            userId
        ]
    );

    return result;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateProfile,
    findByVerificationToken,
    markUserAsVerified,
    setResetToken,
    findByResetToken,
    updatePassword,
    updateUserDocuments
}