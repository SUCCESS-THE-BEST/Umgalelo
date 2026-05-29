const userModel = require('../models/user');
const membershipModel = require('../models/membership');
const societyModel = require('../models/society');
const notificationModel = require('../models/notifications')

//profile page

const getUser = async (req, res) => {
    try {
        const [user] = await userModel.findUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const {
            idNumber,
            gender,
            dob,
            phone,
            addressLine1,
            city,
            province,
            postalCode,
            nextOfKinName,
            nextOfKinPhone
        } = req.body;

        const user_id = req.user.userId;

        await userModel.updateProfile(
            user_id,
            idNumber,
            gender,
            dob,
            phone,
            addressLine1,
            city,
            province,
            postalCode,
            nextOfKinName,
            nextOfKinPhone
        );

        res.status(200).json({
            message: "Profile updated successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const uploadDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;

        const profilePhoto =
            req.files && req.files.profilePhoto
                ? req.files.profilePhoto[0].secure_url
                : null;

        const idDocument =
            req.files && req.files.idDocument
                ? req.files.idDocument[0].secure_url
                : null;

        const bankingProof =
            req.files && req.files.bankingProof
                ? req.files.bankingProof[0].secure_url
                : null;

        await userModel.updateUserDocuments(
            userId,
            profilePhoto,
            idDocument,
            bankingProof
        );

        res.json({
            message: 'Documents uploaded successfully',
            profilePhoto,
            idDocument,
            bankingProof
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Upload failed',
            error: error.message
        });
    }
};

const leaveSociety = async (req, res) => {

    try {

        const userId = req.user.userId;
        const { societyId } = req.params;

        // prevent admin from leaving
        const isAdmin = await membershipModel.isAdmin(
            userId,
            societyId
        );

        if (isAdmin) {
            return res.status(400).json({
                message: 'Admins cannot leave their own society'
            });
        }

        // get society before removing member
        const society = await societyModel.findSocietyById(societyId);
        const societyName = society[0].society_name;
        const adminId = society[0].admin_id;

        // get user before removing member
        const user = await userModel.findUserById(userId);
        const fullName = `${user[0].first_name} ${user[0].last_name}`;

        await societyModel.leaveSociety(
            userId,
            societyId
        );

        // notify user
        await notificationModel.createNotification(
            userId,
            societyId,
            `You have left ${societyName}`,
            'left_society'
        );

        // notify admin
        await notificationModel.createNotification(
            adminId,
            societyId,
            `${fullName} has left ${societyName}`,
            'member_left'
        );

        res.json({
            message: 'You left the society'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

module.exports = {
    getUser,
    updateProfile,
    uploadDocuments,
    leaveSociety
}