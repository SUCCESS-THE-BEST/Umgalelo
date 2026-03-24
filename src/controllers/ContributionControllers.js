const financialModel = require('../models/Contribution');

const AddContribution = async (req, res) => {
  try {
    const { userId, societyId, amount } = req.body;

    if (!userId || !societyId || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await financialModel.AddContribution(userId, societyId, amount);

    res.status(200).json({
      message: 'Payment successful',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error processing payment'
    });
  }
};

module.exports = { 
    AddContribution
};