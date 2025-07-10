const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
  name: String,
  address: String,
}, { _id: false });

const subDriverSchema = new mongoose.Schema({
  name: String,
  license: String,
  vehicleNumber: String,
  vehicleType: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: Number, unique: true, required: true },
  dob: { type: Date },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: String,
  role: { type: String, enum: ['User', 'Driver'], default: 'User' },
  ride: { type: String, enum: ['primary', 'sub'], default: 'primary' },

  // Vehicle Info
  vehicleType: String,
  vehicleNumber: String,
  licenseNumber: String,
  subDrivers: [subDriverSchema],

  // DigiLocker fields
  digilockerVerified: { type: Boolean, default: false },
  aadhaarNumber: { type: String, unique: true, sparse: true },
  drivingLicenseNumber: { type: String, unique: true, sparse: true },

  
  // Optional vehicle info
  makeAndModel: String,
  color: String,
  registration: String,
  insurance: String,

  // OTP flow
  otp: String,
  verified: { type: Boolean, default: false },

  // Locations
  savedLocations: [savedLocationSchema],
});

module.exports = mongoose.model('User', userSchema);