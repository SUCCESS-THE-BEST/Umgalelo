const userModel = require('../models/user');

//profile page

const getUser = async (req, res) => {
    try {
        const [user] = await userModel.findUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateContactDetails = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (req.user.userId != req.params.id) {
            return res.status(403).json({ message: 'Forbidden'});
        }

        await userModel.updateContactDetails(req.params.id, email, phone);

        res.json({ message: 'contact details successfully updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserAddress = async (req, res) => {
    try {
         const { addressLine1, city, province, postalCode } = req.body;

         if (req.user.userId != req.params.id) {
            return res.status(403).json({ message: 'Forbidden' });
         }

         await userModel.updateUserAddress(req.params.id, addressLine1, city, province, postalCode);

         res.json({ message: 'user address updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateNextOfKin =  async (req, res) => {
    try {
        const { nextOfKinName, nextOfKinPhone } = req.body;
        console.log(req.user);

        if (req.user.userId != req.params.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await userModel.updateNextOfKin(req.params.id, nextOfKinName, nextOfKinPhone);

        res.json({ message: 'next of kin updated successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { addressLine1, city, province, postalCode, nextOfKinName, nextOfKinPhone } = req.body;
        const user_id = req.user.userId

        // if (req.user.userId != req.params.id) {
        //     return res.status(403).json({ message: 'Forbidden' });
        // }

        await userModel.updateProfile(user_id, addressLine1, city, province, postalCode, nextOfKinName, nextOfKinPhone)
        res.status(201).json({message: "Profile updated successfully!"})

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const uploadDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;

        console.log(req.files);

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

module.exports = {
    getUser,
    updateContactDetails,
    updateUserAddress,
    updateNextOfKin,
    updateProfile,
    uploadDocuments
}