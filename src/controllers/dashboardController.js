const db = require('../config/db');
const societyModel = require('../models/society');
const membershipModel = require('../models/membership');

// ================= PERSONAL DASHBOARD SUMMARY =================
const getDashboardSummary = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const [contributions] = await db.execute(
            `
            SELECT IFNULL(SUM(amount), 0) AS total
            FROM contributions
            WHERE user_id = ?
            `,
            [user_id]
        );

        const [claims] = await db.execute(
            `
            SELECT IFNULL(SUM(claim_amount), 0) AS total
            FROM claims
            WHERE user_id = ?
            AND status = 'approved'
            `,
            [user_id]
        );

        const [societies] = await db.execute(
            `
            SELECT COUNT(*) AS count
            FROM society_members
            WHERE user_id = ?
            `,
            [user_id]
        );

        const total_contributions = Number(contributions[0].total || 0);
        const total_claims = Number(claims[0].total || 0);

        res.json({
            total_contributions,
            total_claims,
            balance: total_contributions - total_claims,
            societies_count: societies[0].count
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= SOCIETY DASHBOARD SUMMARY =================
const getSocietyDashboard = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const society_id = req.params.id;

        const member = await membershipModel.findMember(
            user_id,
            society_id
        );

        if (!member) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        const [contributions] = await db.execute(
            `
            SELECT IFNULL(SUM(amount), 0) AS total
            FROM contributions
            WHERE society_id = ?
            `,
            [society_id]
        );

        const [claims] = await db.execute(
            `
            SELECT IFNULL(SUM(claim_amount), 0) AS total
            FROM claims
            WHERE society_id = ?
            AND status = 'approved'
            `,
            [society_id]
        );

        const [members] = await db.execute(
            `
            SELECT COUNT(*) AS count
            FROM society_members
            WHERE society_id = ?
            `,
            [society_id]
        );

        const total_contributions = Number(contributions[0].total || 0);
        const total_claims = Number(claims[0].total || 0);

        res.json({
            total_contributions,
            total_claims,
            balance: total_contributions - total_claims,
            members_count: members[0].count
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= USER SOCIETY CARDS =================
const getUserSocietyCards = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const rows = await societyModel.getUserSocietyCards(user_id);

        const formatted = rows.map(s => ({
            id: s.society_id,
            society_name: s.society_name,
            monthly_contribution: s.monthly_contribution,
            role: s.role,
            society_members: s.member_count,
            joined: formatDate(s.joined_at),
            has_paid: !!s.has_paid,
            payment_status: s.has_paid ? 'Paid' : 'Due'
        }));

        res.json(formatted);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
};

// ================= USER EVENTS / CALENDAR =================
const getUserEvents = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await db.execute(
            `
            SELECT 
                e.id,
                e.title,
                e.type,
                e.date,
                e.time,
                e.location,
                s.society_name
            FROM events e
            JOIN societies s 
                ON e.society_id = s.society_id
            JOIN society_members sm 
                ON sm.society_id = s.society_id
            WHERE sm.user_id = ?
            AND e.date >= CURDATE()
            ORDER BY e.date ASC, e.time ASC
            LIMIT 5
            `,
            [userId]
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// ================= HELPER =================
const formatDate = date => {
    const d = new Date(date);

    return d.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    });
};

module.exports = {
    getDashboardSummary,
    getSocietyDashboard,
    getUserSocietyCards,
    getUserEvents
};