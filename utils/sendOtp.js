// const nodemailer = require('nodemailer');

// const sendOtp = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `"IdharUdhar" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Your OTP Code',
//     html: `<p>Your OTP code is <b>${otp}</b>. Please use it within the next 10 minutes to verify your account.</p>`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendOtp;

const nodemailer = require('nodemailer');

const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Your OTP for Idhar Udhar',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtp;
