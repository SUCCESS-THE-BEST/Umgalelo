const societyModel = require('../models/societies');
const userModel = require('../models/user');

//create society
const createSociety = async (req, res) => {
    try {
        const { societyName,monthly_contribution,cover_amount,waiting_period,additional_rules,province,city,maximum_members,minimum_age,adminID} = req.body;

        if (!societyName || !monthly_contribution ||!cover_amount||!waiting_period||!additional_rules||!province||!city||!maximum_members||!minimum_age||!adminID) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (Number(monthly_contribution)< 1) {
            return res.status(400).json({ message: 'Invalid monthly contributions' });
        } 

        const exists = await societyModel.findSocietyName(societyName);
      
        if (exists.length > 0) {
            return res.status(400).json({message: 'society already exists'});
        }
        const societyID=await societyModel.createsocieties(societyName,monthly_contribution,cover_amount,waiting_period,additional_rules,province,city,maximum_members,minimum_age,adminID);
        await societyModel.addmembers(societyID,adminID,"admin")
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

module.exports={
    createSociety,
    joinRequest
}