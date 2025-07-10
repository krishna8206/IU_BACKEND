const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const generateToken = require('../utils/generateToken');

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// === Send OTP ===
exports.sendOTP = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      role,             // 'User' or 'Driver'
      driverType,       // 'Primary' or 'Sub' (if role is Driver)
      vehicleType,
      vehicleNumber,
      licenseNumber,
      subDrivers = [],  // Array of sub-driver objects if any
    } = req.body;

    if (!email || !fullName || !phone || !dob || !gender || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        fullName,
        email,
        phone,
        dob,
        gender,
        role,
        otp,
        otpExpires,
      });

      if (role === 'Driver') {
        user.driverType = driverType;
        if (driverType === 'Primary') {
          user.vehicleType = vehicleType;
          user.vehicleNumber = vehicleNumber;
          user.licenseNumber = licenseNumber;
          user.subDrivers = subDrivers;
        } else if (driverType === 'Sub') {
          user.vehicleType = vehicleType;
          user.vehicleNumber = vehicleNumber;
          user.licenseNumber = licenseNumber;
        }
      }
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();
    await sendOtp(email, otp);

    return res.status(200).json({
      message: 'OTP sent successfully',
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// === Verify OTP ===
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'OTP Verified Successfully',
      token,
      user,
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
