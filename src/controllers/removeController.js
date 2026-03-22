const societyModel = require('../models/societies');

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
module.exports = {removeMembers};