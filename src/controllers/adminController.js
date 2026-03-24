const societyModel = require('../models/societies');

const addmember = async (req, res) => {
    try {
        const { userID,societyID} = req.body;

        if (!userID || !societyID ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
       const result = await societyModel.approveRequest(userID, societyID);
        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Join request not found" });
        }
        await societyModel.addmembers(societyID, userID, "member");
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

const listJoinRequest = async (req, res) => {
    try {
        const { societyID } = req.params;
        
        const requests = await societyModel.listJoinedRequests(societyID);
        
        res.status(200).json(requests);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const listAdminSocieties = async (req, res) => {
    try {
        const { adminID } = req.params;
        
        const requests = await societyModel.adminSocieties(adminID);
        
        res.status(200).json(requests);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeMembers = async (req, res) => {
    try {
        const { userID, societyID } = req.params;

        const result = await societyModel.removeMember(userID, societyID);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.status(200).json({ message: 'Member removed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    addmember,
    listmembers,
    listJoinRequest,
    listAdminSocieties,
    removeMembers
};