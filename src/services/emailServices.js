require('dotenv').config();

const transporter = require('../config/email');

const sendEmail = async (to, subject, html) => {
    try {

        const info = await transporter.sendMail({
            from: `"Umgalelo" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html
        });

        console.log(
            `Email sent: ${info.messageId}`
        );

        return true;

    } catch (error) {

        console.error(
            'Email error:',
            error.message
        );

        return false;
    }
};

module.exports = {
    sendEmail
};