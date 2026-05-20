require('dotenv').config()
const transporter = require('../config/email');

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Umgalelo" <01lungasityebi@gmail.com>`,
      to: to,
      subject: subject,
      html: html
    });

    console.log(info)

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = { sendEmail };