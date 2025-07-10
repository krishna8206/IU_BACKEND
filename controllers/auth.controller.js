const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const generateToken = require('../utils/generateToken');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// 🔹 Registration - Send OTP
exports.sendOTP = async (req, res) => {
  const {
    fullName, email, phone, role, vehicleType,
    vehicleNumber, licenseNumber, agreed, ride,
    subDrivers = []
  } = req.body;

  if (!agreed) return res.status(400).json({ message: 'Please accept terms and conditions.' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return res.status(400).json({ message: 'User already exists and is verified.' });
    }

    const otp = generateOTP();
    await sendOtp(email, otp);

    const update = {
      fullName,
      email,
      phone,
      role,
      ride,
      otp,
      verified: false,
      digilockerVerified: false,
    };

    if (role === 'Driver') {
      if (ride === 'primary') {
        update.vehicleType = vehicleType;
        update.vehicleNumber = vehicleNumber;
        update.licenseNumber = licenseNumber;
      } else {
        update.subDrivers = subDrivers;
      }
    }

    const user = await User.findOneAndUpdate({ email }, update, { upsert: true, new: true });
    res.status(200).json({ message: 'OTP sent to email successfully.' });

  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

// 🔹 OTP Verification
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.verified = true;
    user.otp = '';
    await user.save();

    const token = generateToken(user);
    res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};
