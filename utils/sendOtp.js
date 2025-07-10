const nodemailer = require('nodemailer');

const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // should be your Gmail
      pass: process.env.EMAIL_PASS   // should be App Password
    }
  });

  const mailOptions = {
    from: `Idhar Udhar <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'OTP Verification - Idhar Udhar',
    html: `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtp;
