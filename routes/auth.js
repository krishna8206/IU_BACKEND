
const express = require('express');
const router = express.Router();
const { sendOTP, sendLoginOTP, verifyOTP, digilockerCallback } = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ⬅️ adjust this path
const dotenv = require('dotenv');




router.post('/send-otp', sendOTP);         // For registration
router.post('/login-otp', sendLoginOTP);   // For login
router.post('/verify-otp', verifyOTP);     // Shared for both flows

router.post('/google-login', async (req, res) => {
  const { email, name } = req.body;

  try {
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Register user
      user = await User.create({
        name,
        email,
        role: 'Customer', // or 'User', adjust as needed
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user,
      message: 'Google login successful',
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Server error during Google login' });
  }
});


router.get('/digilocker-callback', digilockerCallback);

module.exports = router;