const mongoose = require('mongoose');

const subDriverSchema = new mongoose.Schema({
  driverName: String,
  licenseNumber: String,
  vehicleNumber: String,
  vehicleType: String,
});

const userSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: { type: String, unique: true },
  dob:{type:String},
  gender: String,
  role: { type: String, enum: ['User', 'Driver'], default: 'User' },
  driverType: { type: String, enum: ['Primary', 'Sub'], default: null },
  vehicleType: String,
  vehicleNumber: String,
  licenseNumber: String,
  subDrivers: [subDriverSchema],
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
