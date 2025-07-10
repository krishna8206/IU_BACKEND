// const mongoose = require('mongoose');

// const savedLocationSchema = new mongoose.Schema({
//   name: String,
//   address: String,
// }, { _id: false });

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   phone: { type: Number, unique: true, required: true },
//   dob: { type: Date, required: true },
//   gender: {
//     type: String,
//     enum: ['Male', 'Female', 'Other'],
//     required: true,
//   },
//   address: String,
//   role: { type: String, enum: ['User', 'Driver'], default: 'User' },
//   vehicleType: String,
//   vehicleNumber: String,
//   licenseNumber: String,
//   otp: String,
//   verified: { type: Boolean, default: false },

//   digilockerVerified: {
//     type: Boolean,
//     default: false,
//   },
//   aadhaarNumber: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   drivingLicenseNumber: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },

//   savedLocations: [savedLocationSchema],

//   // 🆕 Fields from UI
//   makeAndModel: String,
//   color: String,
//   registration: String,
//   insurance: String,
// });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
  name: String,
  address: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: Number, unique: true, required: true },
  dob: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  address: String,

  role: { type: String, enum: ['User', 'Driver', 'SubDriver'], default: 'User' },

  vehicleType: String,
  vehicleNumber: String,
  licenseNumber: String,

  parentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  otp: String,
  verified: { type: Boolean, default: false },

  digilockerVerified: {
    type: Boolean,
    default: false,
  },
  aadhaarNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  drivingLicenseNumber: {
    type: String,
    unique: true,
    sparse: true,
  },

  savedLocations: [savedLocationSchema],

  // Extra fields (optional)
  makeAndModel: String,
  color: String,
  registration: String,
  insurance: String,
});

module.exports = mongoose.model('User', userSchema);
