const financialModel = require('../models/Claim');

const SubmitClaim = async (req, res) => {
  try {
    const { societyId, userId, deceasedName, relationship, amount } = req.body;

    if (!societyId || !userId || !deceasedName || !relationship || !amount) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const result = await financialModel.SubmitClaim(societyId, userId, deceasedName, relationship, amount);

    res.status(200).json({
      message: 'Claim submitted (pending)',
      data: result
    });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting claim' });
  }
};


const ApproveClaim = async (req, res) => {
  try {
    const claimId = req.params.claim_id;

    if (!claimId) {
      return res.status(400).json({ message: 'Claim ID is required' });
    }

    const result = await financialModel.ApproveClaim(claimId);

    res.status(200).json({
      message: 'Claim approved successfully',
      data: result
    });

  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.message === 'Insufficient funds') {
      return res.status(400).json({ message: 'Not enough money in wallet' });
    }

    if (error.message === 'Claim not found') {
      return res.status(404).json({ message: 'Claim not found' });
    }

    if (error.message === 'Already processed') {
      return res.status(400).json({ message: 'Claim already processed' });
    }

    res.status(500).json({
      message: 'Error approving claim'
    });
  }
};

const RejectClaim = async (req, res) => {
    try {
    const claimId = req.params.claim_id;

    if (!claimId) {
      return res.status(400).json({ message: 'Claim ID is required' });
    }

    const result = await financialModel.RejectClaim(claimId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Claim not found or already processed' });
    }

    res.status(200).json({
      message: 'Claim rejected successfully',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error approving claim'
    });
  }
}

const GetClaimsBySociety = async (req, res) => {
  try {
    const societyId = req.params.societyId;

    if (!societyId) {
      return res.status(400).json({ message: 'Society ID is required' });
    }

    const claims = await financialModel.GetClaimsBySociety(societyId);

    res.status(200).json({
      message: 'Claims fetched successfully',
      data: claims
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
    message: 'Error fetching claims'
    });
  }
};

module.exports = {
    SubmitClaim,
    ApproveClaim,
    RejectClaim,
    GetClaimsBySociety
}