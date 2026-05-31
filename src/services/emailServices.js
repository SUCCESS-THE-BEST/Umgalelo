const axios = require('axios');

const sendEmail = async (to, subject, html) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'Umgalelo',
                    email: process.env.EMAIL_FROM
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Email sent:', response.data);
        return response.data;

    } catch (error) {
        console.error(
            'Email API error:',
            error.response?.data || error.message
        );
    }
};

module.exports = {
    sendEmail
};