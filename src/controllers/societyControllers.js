const societyModel = require('../models/societies');


//create society
const createSociety = async (req, res) => {
    try {
        const { societyName,monthlyContribution, adminID} = req.body;

        if (!societyName || !monthlyContribution || !adminID) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (Number(monthlyContribution)< 1) {
            return res.status(400).json({ message: 'Invalid monthly contributions' });
        }

        const exists = await societyModel.findSocietyName(societyName);
        if (exists.length > 0) {
            return res.status(400).json({message: 'society already exists'});
        }
         const adminExists= await societyModel.findAdminID(adminID)
         if (adminExists.length > 0) {
            return res.status(400).json({message: 'admin already exists'});
        }
        await societyModel.createsocieties(societyName,monthlyContribution, adminID);

        res.status(200).json({ message: 'society created successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//join request
const joinRequest = async (req, res) => {
    try {
        const { userID,societyID} = req.body;

        if (!userID || !societyID) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        await societyModel.joinRequests(userID,societyID);
        res.status(200).json({ message: 'join request successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//change user status
const addmember = async (req, res) => {
    try {
        const { userID,societyID} = req.body;

        if (!userID || !societyID ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        await societyModel.addmembers(userID,societyID);
        res.status(200).json({ message: 'member was added successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const listmembers = async (req, res) => {
    try {
        const { societyID } = req.params;

        const members = await societyModel.getSocietyMembers(societyID);

        res.status(200).json(members);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports={
    createSociety,
    joinRequest,
    addmember,
    listmembers
}