const db = require('../config/db')
const contributionModel = require('../models/contribution');
const claimModel = require('../models/claim')
const membershipModel = require('../models/membership');
const { sendEmail } = require('../services/emailServices');
const userModel = require('../models/user');
const societyModel = require('../models/society');
const notificationModel = require('../models/notifications')

const getCurrentPaymentMonth = () => {
    const formatter = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        year: 'numeric',
        month: '2-digit'
    });

    const parts = formatter.formatToParts(new Date());

    const year = parts.find(p => p.type === 'year').value;
    const month = parts.find(p => p.type === 'month').value;

    return `${year}-${month}`;
};

// ========= MAKE CONTRIBUTION ==========
const makeContribution = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;
    const { amount, month } = req.body;

    const exits = await contributionModel.checkMonthlyContributionExists(user_id, society_id, month)
    if (exits.length > 0) {
      return res.status(400).json({message: 'Payment Already Exists For The Month'})
    }

    const contributionRes = await contributionModel.createContribution(user_id, society_id, amount, month);

    // ========= UPDATE SOCIETY WALLET ===========
    const walletRes = await contributionModel.UpdateSocietyWallet(society_id, amount);

    // ========= EMAIL START ==============
    const [user] = await userModel.findUserById(user_id);

    const [society] = await societyModel.findSocietyById(society_id);
    
    await sendEmail(
      user.email,
      'Payment Receipt - Umgalelo',
      `
        <h2>Payment Successful</h2>
        <p>Hi ${user.first_name},</p>
        <p>Your payment of <strong>R${amount}</strong> was received.</p>
        <p><strong>Society:</strong> ${society.society_name}</p>
        <p><strong>Month:</strong> ${month}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      `
    );

    // ========== EMAIL END =============
    

    res.json({ message: 'Payment Successfull' });
    

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========== PAYFAST API ==============

const {
    createPayfastPayment
} = require('../services/payfastService');

const initiatePayfastPayment = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const society_id = req.params.id;

        const { amount, month } = req.body;

        const exists =
            await contributionModel.checkMonthlyContributionExists(
                user_id,
                society_id,
                month
            );

        if (exists.length > 0) {
            return res.status(400).json({
                message: 'Payment already exists for this month'
            });
        }

        const [society] =
            await societyModel.findSocietyById(society_id);

        const payment =
            createPayfastPayment({
                userId: user_id,
                societyId: society_id,
                amount,
                month,
                itemName: `${society.society_name} contribution - ${month}`
            });

        res.json({
            paymentUrl: payment.paymentUrl,
            paymentId: payment.paymentId
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ============= ITN HANDLER =================
const payfastITN = async (req, res) => {
    try {

        console.log('========== PAYFAST ITN ==========');
        const {
            payment_status,
            custom_int1,
            custom_int2,
            custom_str1,
            amount_gross
        } = req.body;

        if (payment_status !== 'COMPLETE') {
            return res.status(200).send('Ignored');
        }

        const user_id = custom_int1;
        const society_id = custom_int2;
        const month = custom_str1;
        const amount = amount_gross;

        const exists =
            await contributionModel.checkMonthlyContributionExists(
                user_id,
                society_id,
                month
            );

        if (exists.length > 0) {
            return res.status(200).send('Already recorded');
        }

        await contributionModel.createContribution(
            user_id,
            society_id,
            amount,
            month
        );

        await contributionModel.UpdateSocietyWallet(
            society_id,
            amount
        );

        // ========= EMAIL RECEIPT AFTER PAYFAST PAYMENT =========
        const [user] = await userModel.findUserById(user_id);

        const [society] = await societyModel.findSocietyById(society_id);

        await sendEmail(
            user.email,
            'Payment Receipt - Umgalelo',
            `
                <h2>Payment Successful</h2>

                <p>Hi ${user.first_name},</p>

                <p>
                    Your PayFast payment of
                    <strong>R${amount}</strong>
                    was received successfully.
                </p>

                <p><strong>Society:</strong> ${society.society_name}</p>
                <p><strong>Month:</strong> ${month}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

                <p>Thank you for your contribution.</p>
            `
        );

        res.status(200).send('OK');

    } catch (error) {
        console.log(error);
        res.status(500).send('ITN failed');
    }
};

// ======== USER SPECIFIC CONTRIBUTION HISTORY ===========
const getUserContributionHistory = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const payments = await contributionModel.getUserContributionHistory(user_id);

    const formatted = payments.map(p => ({
      id: p.contribution_idid,
      society: p.society_name,
      amount: p.amount,
      date: new Date(p.payment_date).toLocaleDateString()
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ============= society contribution history ===============
const getSocietyContributionHistory = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const society_id = req.params.id;

    const member = await membershipModel.findMember(user_id, society_id);

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let payments;

    if (member.role === 'admin') {
      payments = await contributionModel.getSocietyPaymentHistory(society_id);
    } else {
      payments = await contributionModel.getMemberSocietyPaymentHistory(
        user_id,
        society_id
      );
    }

    const formatted = payments.map(p => ({
      id: p.contribution_id,
      first_name: p.first_name,
      last_name: p.last_name,
      amount: p.amount,
      status: p.status,
      payment_date: p.payment_date != null
        ? new Date(p.payment_date).toLocaleDateString()
        : null,
      payment_month: p.payment_month
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======= DATE FORMATTING HELPER ==========
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const sendPaymentReminders = async (req, res) => {

    try {

        const user_id = req.user.userId;
        const society_id = req.params.id;

        // =========== CHECK ADMIN ============
        const member = await membershipModel.findMember(user_id, society_id);

        if (!member || member.role !== 'admin') {
            return res.status(403).json({
                message: 'Only admins can send reminders'
            });
        }

        // ======== CURRENT MONTH ==========
        const payment_month = getCurrentPaymentMonth();

        // ======== GET UNPAID MEMBERS ============
        const unpaidMembers =
            await contributionModel.getUnpaidMembers(
                society_id,
                payment_month
            );

        // =========== SEND NOTIFICATIONS ==============
        for (const member of unpaidMembers) {

            await notificationModel.createNotification(
                member.user_id,
                member.society_id,
                `Reminder: Your ${payment_month} contribution payment is still due.`
            );
        }

        res.json({
            message: `Reminders sent to ${unpaidMembers.length} members`
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
  makeContribution,
  getUserContributionHistory,
  getSocietyContributionHistory,
  sendPaymentReminders,
  initiatePayfastPayment,
  payfastITN
};