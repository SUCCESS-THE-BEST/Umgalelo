const financialModel = require('../models/Contribution');

const ProcessContribution = async (req, res) => {
  try {
    const { userId, societyId, amount } = req.body;

    if (!userId || !societyId || amount <= 0) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    await financialModel.ProcessContribution(userId, societyId, amount);

    res.status(200).json({
      message: 'Contribution successful'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error processing contribution'
    });
  }
};

const GetContributionsBySociety = async (req, res) => {
  try {
    const societyId = req.params.societyId;

    const data = await financialModel.GetContributionsBySociety(societyId);

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GetContributionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const data = await financialModel.GetContributionsByUser(userId);

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GetSocietyWallet = async (req, res) => {
  try {
    const societyId = req.params.societyId;

    if (!societyId) {
      return res.status(400).json({ message: 'Society ID is required' });
    }

    const wallet = await financialModel.getSocietyWallet(societyId);

    res.status(200).json({
      message: 'Wallet fetched successfully',
      data: wallet
    });

  } catch (error) {
    console.error(error);

    if (error.message === 'Society wallet not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: 'Error fetching wallet'
    });
  }
};

module.exports = { 
  ProcessContribution,
  GetContributionsBySociety,
  GetContributionsByUser,
  GetSocietyWallet
};