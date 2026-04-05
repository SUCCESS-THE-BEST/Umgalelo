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

module.exports = {
    getUser,
    updateContactDetails,
    updateUserAddress,
    updateNextOfKin   
}