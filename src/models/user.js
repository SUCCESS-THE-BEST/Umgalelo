//database queries
const db = require('../config/db');

const createUser = async (firstName, lastName, email, phone, idNumber, password) => {
    const [response] = await db.execute(
        'INSERT INTO users (first_name, last_name, email, phone, id_number, password) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, idNumber, password]
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

const findUserById = async (userId) => {
    const [response] = await db.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
    );

    return response;
};

const updateContactDetails = async (userId, email, phone) => {
    const [response] = await db.execute(
        'UPDATE users SET email = ?, phone = ? WHERE user_id = ?',
        [email, phone, userId] 
    );

    return response;
};

const updateUserAddress = async (userId, addressLine1, city, province, postalCode) => {
    const [response] = await db.execute(
        'UPDATE users SET address_line1 = ?, city = ?, province = ?, postal_code = ? WHERE user_id = ?',
        [addressLine1, city, province, postalCode, userId]
    );

    return response;
};

const updateNextOfKin = async (userId, nextOfKinName, nextOfKinPhone) => {
    const [response] = await db.execute(
        'UPDATE users SET next_of_kin_name = ?, next_of_kin_phone = ? WHERE user_id = ?',
        [nextOfKinName, nextOfKinPhone, userId]
    );

    return response;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateContactDetails,
    updateUserAddress,
    updateNextOfKin
}