// const express = require('express');
// const router = express.Router();
// const { sendOTP, verifyOTP } = require('../controllers/authController');

// router.post('/send-otp', sendOTP);
// router.post('/verify-otp', verifyOTP);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  loginWithOTP,
  verifyLoginOTP,
} = require('../controllers/authController');

router.post('/send-otp', sendOTP);                 // Signup OTP
router.post('/verify-otp', verifyOTP);             // Signup OTP verification
router.post('/login-otp', loginWithOTP);           // Login - Send OTP
router.post('/verify-login-otp', verifyLoginOTP);  // Login - Verify OTP

module.exports = router;
