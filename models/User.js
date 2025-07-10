<<<<<<< HEAD
=======
// <<<<<<< HEAD
// =======
// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //   fullName: { type: String, required: false },
// //   email: { type: String, unique: true, required: true },
// //   phone: { type: Number, unique: true, required: true },
  
// //   role: { type: String, enum: ['User', 'Driver', 'Admin'], default: 'User' },
// //   vehicleType: String,
// //   vehicleNumber: String,
// //   licenseNumber: String,
// //   otp: String,
// //   verified: { type: Boolean, default: false },
// // });

// // module.exports = mongoose.model('User', userSchema);

// >>>>>>> 139f86616ae2512101fbdac92d77035f26df1d89

// const mongoose = require('mongoose');

// const savedLocationSchema = new mongoose.Schema({
//   name: String,
//   address: String,
// }, { _id: false });

// const userSchema = new mongoose.Schema({
//   fullName: String,
//   email: { type: String, unique: true, required: true },
//   phone: { type: Number, unique: true, required: true },
//   address: String,
//   role: { type: String, enum: ['User', 'Driver'], default: 'User' },
//   vehicleType: String,
//   vehicleNumber: String,
//   licenseNumber: String,
//   otp: String,
//   verified: { type: Boolean, default: false },

//   savedLocations: [savedLocationSchema],
// });

// module.exports = mongoose.model('User', userSchema);


>>>>>>> b7a11b5966a608f131edf4d80b088cd95e3ccfbc
const mongoose = require('mongoose');

const savedLocationSchema = new mongoose.Schema({
  name: String,
  address: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: Number, unique: true, required: true },
  address: String,
  role: { type: String, enum: ['User', 'Driver'], default: 'User' },
  vehicleType: String,
  vehicleNumber: String,
  licenseNumber: String,
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

  // 🆕 Fields from UI
  makeAndModel: String,
  color: String,
  registration: String,
  insurance: String,
});

module.exports = mongoose.model('User', userSchema);