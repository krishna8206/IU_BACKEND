// const User = require('../models/User');
// const sendOtp = require('../utils/sendOtp');
// const generateToken = require('../utils/generateToken');
// const config = require('../config/config');
// const axios = require('axios');
// const xml2js = require('xml2js');

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });

// // 🔹 Registration - Send OTP
// exports.sendOTP = async (req, res) => {
//   const { fullName, email, phone, role, vehicleType, vehicleNumber, licenseNumber, agreed, gender, dob } = req.body;

//   if (!agreed) return res.status(400).json({ message: 'You must agree to terms and conditions.' });

//   try {
//     const existingUser = await User.findOne({ email });

//     if (existingUser && existingUser.verified) {
//       return res.status(400).json({ message: 'Email is already registered and verified.' });
//     }

//     const otp = generateOTP();
//     await sendOtp(email, otp);

//     const update = {
//       fullName,
//       email,
//       phone,
//       gender,
//       dob,
//       role,
//       otp,
//       otpExpires: Date.now() + 5 * 60 * 1000,
//       vehicleType: role === 'Driver' ? vehicleType : '',
//       vehicleNumber: role === 'Driver' ? vehicleNumber : '',
//       licenseNumber: role === 'Driver' ? licenseNumber : '',
//       verified: false,
//       digilockerVerified: false,
//       aadhaarNumber: null,
//       drivingLicenseNumber: null,
//     };

//     const user = await User.findOneAndUpdate({ email }, update, { upsert: true, new: true });

//     req.session.userIdForDigiLocker = user._id.toString();
//     res.status(200).json({ message: 'OTP sent to email. Please verify to continue.' });

//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Server error while sending OTP.' });
//   }
// };

// // 🔹 Login - Send OTP
// exports.sendLoginOTP = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !user.verified) return res.status(404).json({ message: 'User not found or not verified.' });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     await sendOtp(email, otp);
//     res.status(200).json({ message: 'OTP sent to email.' });

//   } catch (error) {
//     console.error('Login OTP error:', error);
//     res.status(500).json({ message: 'Server error while sending login OTP.' });
//   }
// };

// // 🔹 Common - Verify OTP
// exports.verifyOTP = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP.' });
//     }

//     user.verified = true;
//     user.otp = '';
//     user.otpExpires = null;
//     await user.save();

//     const token = generateToken(user);

//     if (user.role === 'Driver' && !user.digilockerVerified) {
//       req.session.userIdForDigiLocker = user._id.toString();
//       const state = `${user._id}-${Math.random().toString(36).substring(2)}`;
//       req.session.digilockerState = state;

//       const digilockerAuthUrl = `${config.digilockerAuthUrl}?response_type=code&client_id=${config.digilockerClientId}&redirect_uri=${config.digilockerRedirectUri}&state=${state}&scope=profile:read documents:read`;

//       return res.status(200).json({
//         message: 'Account verified. Please link DigiLocker.',
//         token,
//         user,
//         redirectToDigiLocker: true,
//         digilockerAuthUrl
//       });
//     }

//     res.status(200).json({
//       message: 'Account verified successfully.',
//       token,
//       user
//     });

//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({ message: 'Server error while verifying OTP.' });
//   }
// };

// // 🔹 DigiLocker Callback
// exports.digilockerCallback = async (req, res) => {
//   const { code, state, error, error_description } = req.query;
//   const userId = req.session.userIdForDigiLocker;

//   if (error) {
//     return res.send(`<html><body><p>DigiLocker error: ${error_description || error}</p></body></html>`);
//   }

//   if (!userId || state !== req.session.digilockerState) {
//     return res.status(403).send(`<html><body><p>Invalid session or state. Try again.</p></body></html>`);
//   }

//   try {
//     const tokenRes = await axios.post(config.digilockerTokenUrl, null, {
//       params: {
//         code,
//         client_id: config.digilockerClientId,
//         client_secret: config.digilockerClientSecret,
//         redirect_uri: config.digilockerRedirectUri,
//         grant_type: 'authorization_code'
//       },
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//     });

//     const access_token = tokenRes.data.access_token;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).send(`<html><body><p>User not found.</p></body></html>`);

//     user.digilockerVerified = true;

//     // Fetch Aadhaar XML
//     try {
//       const aadhaarRes = await axios.get(config.digilockerAadhaarUrl, {
//         headers: {
//           'Authorization': `Bearer ${access_token}`,
//           'Accept': 'application/xml'
//         },
//         responseType: 'text'
//       });

//       await parser.parseString(aadhaarRes.data, (err, result) => {
//         if (!err && result) {
//           if (result.eAadhaar?.Uid) {
//             user.aadhaarNumber = result.eAadhaar.Uid;
//           } else if (result.AuthRes?.KycRes?.UidData?.$?.uid) {
//             user.aadhaarNumber = result.AuthRes.KycRes.UidData.$.uid;
//           }
//         }
//       });
//     } catch (e) {
//       console.error('Aadhaar fetch error:', e.message);
//     }

//     // Fetch Driving License info
//     try {
//       const docsRes = await axios.get(config.digilockerIssuedDocumentsUrl, {
//         headers: { 'Authorization': `Bearer ${access_token}` }
//       });

//       const dl = docsRes.data.items?.find(doc => doc.doctype === 'DL' || doc.type === 'Driving License');
//       if (dl?.doctoken) user.drivingLicenseNumber = dl.doctoken;
//       else if (dl?.Attributes?.DLN) user.drivingLicenseNumber = dl.Attributes.DLN;
//     } catch (e) {
//       console.error('DL fetch error:', e.message);
//     }

//     await user.save();

//     delete req.session.userIdForDigiLocker;
//     delete req.session.digilockerState;

//     return res.send(`
//       <html>
//         <body>
//           <p>DigiLocker documents linked successfully.</p>
//           <script>
//             if (window.opener) {
//               window.opener.postMessage('digilocker-linked-success', '*');
//               window.close();
//             } else {
//               window.location.href = '/dashboard';
//             }
//           </script>
//         </body>
//       </html>
//     `);

//   } catch (err) {
//     console.error('DigiLocker callback error:', err.message);
//     return res.status(500).send(`<html><body><p>Error during DigiLocker linking.</p></body></html>`);
//   }
// };


const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const generateToken = require('../utils/generateToken');
const config = require('../config/config');
const axios = require('axios');
const xml2js = require('xml2js');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });

exports.sendOTP = async (req, res) => {
  const {
    fullName, email, phone, role,
    ride, // "primary" or "sub"
    parentDriverId,
    vehicleType, vehicleNumber, licenseNumber,
    agreed, gender, dob
  } = req.body;

  if (!agreed) return res.status(400).json({ message: 'You must agree to terms and conditions.' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
      return res.status(400).json({ message: 'Email is already registered and verified.' });
    }

    const otp = generateOTP();
    await sendOtp(email, otp);

    const update = {
      fullName,
      email,
      phone,
      gender,
      dob,
      role: ride === 'sub' ? 'SubDriver' : role,
      vehicleType: ride === 'sub' ? '' : vehicleType,
      vehicleNumber: ride === 'sub' ? '' : vehicleNumber,
      licenseNumber: ride === 'sub' ? '' : licenseNumber,
      parentDriver: ride === 'sub' ? parentDriverId : null,
      otp,
      verified: false,
      digilockerVerified: false,
      aadhaarNumber: null,
      drivingLicenseNumber: null,
    };

    const user = await User.findOneAndUpdate({ email }, update, { upsert: true, new: true });
    req.session.userIdForDigiLocker = user._id.toString();

    res.status(200).json({ message: 'OTP sent to email. Please verify to continue.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

exports.sendLoginOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.verified) {
      return res.status(404).json({ message: 'User not found or not verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    await sendOtp(email, otp);

    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.verified = true;
    user.otp = '';
    await user.save();

    const token = generateToken(user);

    if (user.role === 'Driver' && !user.digilockerVerified) {
      req.session.userIdForDigiLocker = user._id.toString();

      const state = `${user._id}-${Math.random().toString(36).substring(2, 15)}`;
      req.session.digilockerState = state;

      const digilockerAuthUrl = `${config.digilockerAuthUrl}?response_type=code&client_id=${config.digilockerClientId}&redirect_uri=${config.digilockerRedirectUri}&state=${state}&scope=profile:read documents:read`;

      return res.status(200).json({
        message: 'Account verified. Please link DigiLocker.',
        token,
        user: {
          id: user._id, fullName: user.fullName, email: user.email,
          phone: user.phone, role: user.role, digilockerVerified: user.digilockerVerified,
        },
        redirectToDigiLocker: true,
        digilockerAuthUrl,
      });
    }

    res.status(200).json({
      message: 'Account verified successfully.',
      token,
      user: {
        id: user._id, fullName: user.fullName, email: user.email,
        phone: user.phone, role: user.role, digilockerVerified: user.digilockerVerified,
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};

exports.digilockerCallback = async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const userId = req.session.userIdForDigiLocker;

  if (error) {
    return res.send(`<html><body><p>DigiLocker Error: ${error_description}</p></body></html>`);
  }

  if (!req.session.digilockerState || state !== req.session.digilockerState) {
    return res.status(403).send(`<html><body><p>Invalid session. Try again.</p></body></html>`);
  }

  if (!userId) {
    return res.status(400).send(`<html><body><p>Session expired. Please log in again.</p></body></html>`);
  }

  try {
    const tokenResponse = await axios.post(config.digilockerTokenUrl, null, {
      params: {
        code,
        client_id: config.digilockerClientId,
        client_secret: config.digilockerClientSecret,
        redirect_uri: config.digilockerRedirectUri,
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send(`<html><body><p>User not found.</p></body></html>`);

    user.digilockerVerified = true;

    try {
      const aadhaarResponse = await axios.get(config.digilockerAadhaarUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/xml'
        },
        responseType: 'text'
      });

      if (aadhaarResponse.data) {
        await parser.parseString(aadhaarResponse.data, (err, result) => {
          if (!err && result?.eAadhaar?.Uid) {
            user.aadhaarNumber = result.eAadhaar.Uid;
          }
        });
      }
    } catch (err) {
      console.error("Aadhaar fetch failed:", err.message);
    }

    try {
      const issuedDocsResponse = await axios.get(config.digilockerIssuedDocumentsUrl, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      const issuedDocs = issuedDocsResponse.data.items;
      if (Array.isArray(issuedDocs)) {
        const dlDoc = issuedDocs.find(doc => doc.doctype === 'DL' || doc.type === 'Driving License');
        if (dlDoc?.doctoken) user.drivingLicenseNumber = dlDoc.doctoken;
      }
    } catch (err) {
      console.error("DL fetch failed:", err.message);
    }

    await user.save();
    delete req.session.digilockerState;
    delete req.session.userIdForDigiLocker;

    res.send(`
      <html><body>
        <p>DigiLocker documents linked successfully!</p>
        <script>
          if (window.opener) {
            window.opener.postMessage('digilocker-linked-success', '*');
            window.close();
          }
        </script>
      </body></html>
    `);

  } catch (err) {
    console.error("DigiLocker callback error:", err.message);
    res.status(500).send(`<html><body><p>Error during document linking. Try again.</p></body></html>`);
  }
};
