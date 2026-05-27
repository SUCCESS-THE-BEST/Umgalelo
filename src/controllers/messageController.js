const messageModel = require('../models/message');

const getMessages = async (req, res) => {

    try {

        const societyId = req.params.societyId;

        const messages = await messageModel.getMessagesBySociety(societyId);

        res.json(messages);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });

    }

};

module.exports = {
    getMessages
};