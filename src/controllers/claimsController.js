const db = require('../config/db')
const contributionModel = require('../models/contribution');
const claimModel = require('../models/claim')
const membershipModel = require('../models/membership');
const notificationModel = require('../models/notifications')

// ======= SUBMIT CLAIM =========
const submitClaim = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;
    const { deceased_name, relationship, claim_amount, date_of_passing } = req.body;

    await claimModel.createClaim(user_id, society_id, deceased_name, relationship, claim_amount, date_of_passing);

    res.json({ message: 'Claim request submitted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// //approve claim
// const approveClaim = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const admin_id = req.user.userId;
//     const claim_id = req.params.id;

//     const claim = await claimModel.getById(claim_id);

//     if (!claim || claim.status !== 'pending') {
//       return res.status(400).json({ message: 'Invalid claim' });
//     }

//     const isAdmin = await membershipModel.isAdmin(admin_id, claim.society_id);
//     if (!isAdmin) {
//       return res.status(403).json({ message: 'Admins only' });
//     }

//     //CHECK BALANCE
//     const totalContributions = await contributionModel.getTotalBySociety(claim.society_id);
//     const totalClaims = await claimModel.getTotalClaims(claim.society_id);

//     const balance = totalContributions - totalClaims;

//     if (claim.claim_amount > balance) {
//       return res.status(400).json({ message: 'Insufficient funds' });
//     }

//     await connection.beginTransaction();

//     await claimModel.updateStatus(claim_id, 'approved', connection);

//     await connection.commit();

//     res.json({ message: 'Claim approved' });

//   } catch (error) {
//     await connection.rollback();
//     res.status(500).json({ message: error.message });
//   } finally {
//     connection.release();
//   }
// };


// //reject claim
// const rejectClaim = async (req, res) => {
//   try {
//     const claim_id = req.params.id;

//     await claimModel.updateStatus(claim_id, 'rejected');

//     res.json({ message: 'Claim rejected' });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ======= GET CLAIMS =========
const getClaims = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;

    // ======= MEMBERS ONLY =======
    const isMember = await membershipModel.findMember(user_id, society_id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const claims = await claimModel.getClaims(society_id);

    const formatted = claims.map(c => ({
      id: c.claim_id,
      name: `${c.first_name} ${c.last_name}`,
      relationship: c.relationship,
      amount: c.claim_amount,
      status: c.status,
      date: c.claim_date,
      date_of_passing: c.date_of_death
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== HELPER ========
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};


// ======= APPROVE / REJECT CLAIMS =========
const updateClaimStatus = async (req, res) => {
  const { id } = req.params;
  const { society_id, status } = req.body;

  try {

    const user_id = req.user.userId;

    // ===== VERFIY IF MEMBER EXISTS ======
    const member = await membershipModel.findMember(user_id, society_id);

    if (!member) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // ======== ONLY ADMIN CAN APPROVE / REJECT CLAIMS =======
    if (member.role !== 'admin') {
      return res.status(403).json({
        message: "Only admins can manage claims"
      });
    }

    // ====== VALIDATE STATUS ========
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    // ======== APPROVE CLAIMS ========
    if (status === 'approved') {

      const claimInfo = claimModel.getById(id);

      await notificationModel.createNotification(
          claimInfo[0].user_id,
          claimInfo[0].society_id,
          `Your claim has been approved.`
      );
    }

    await claimModel.updateStatus(id, status)

    res.json({ message: `Claim ${status}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating claim" });
  }
};


const getClaimsSummary = async (req, res) => {
  try {

    const society_id = req.params.id;

    const summary = await claimModel.getClaimsSummary(society_id);

    res.json(summary);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// =================== DELETE CLAIMS ======================
const deleteClaim = async (req, res) => {

    try {

        const claimId = req.params.id;

        const userId = req.user.userId;

        const claims = await claimModel.getById(claimId);

        if (claims.length === 0) {

            return res.status(404).json({
                message: 'Claim not found'
            });
        }

        // ================= OWNER CHECK =================
        if (claims.user_id !== userId) {

            return res.status(403).json({
                message: 'Unauthorized'
            });
        }

        // ================= STATUS CHECK =================
        if (claims.status !== 'pending') {

            return res.status(400).json({
                message:
                'Only pending claims can be cancelled'
            });
        }

        const response = await claimModel.cancelClaim(claimId)

        res.json({
            message: 'Claim cancelled'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    submitClaim,
    getClaims,
    updateClaimStatus,
    getClaimsSummary,
    deleteClaim
}