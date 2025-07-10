const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const generateToken = require('../utils/generateToken');
const config = require('../config/config'); // Import your config file
const axios = require('axios'); // For making HTTP requests to DigiLocker API
const xml2js = require('xml2js'); // For parsing XML responses from DigiLocker

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true }); // Initialize XML parser

// 🔹 Registration - Send OTP
exports.sendOTP = async (req, res) => {
  const { fullName, email, phone, role, vehicleType, vehicleNumber, licenseNumber, agreed,gender,dob } = req.body;

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
      role,
      phone,
      gender,
      dob,
      vehicleType: role === 'Driver' ? vehicleType : '',
      vehicleNumber: role === 'Driver' ? vehicleNumber : '',
      licenseNumber: role === 'Driver' ? licenseNumber : '', // This might be overridden by DigiLocker
      otp,
      verified: false,
      digilockerVerified: false, // Initialize DigiLocker verification status
      aadhaarNumber: null, // Reset or initialize
      drivingLicenseNumber: null, // Reset or initialize
    };

    const user = await User.findOneAndUpdate({ email }, update, { upsert: true, new: true });

    // Store user ID in session temporarily, so it can be used in DigiLocker callback
    req.session.userIdForDigiLocker = user._id.toString();

    res.status(200).json({ message: 'OTP sent to email. Please verify to continue to document linking.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

// 🔹 Login - Send OTP (No change needed here, as DigiLocker is for new registrations or specific linking)
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

// 🔹 Common - Verify OTP (for both registration and login)
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

    // If the user's role is Driver, and they are new,
    // we want to prompt them to link DigiLocker
    if (user.role === 'Driver' && !user.digilockerVerified) {
      // Store user ID in session for the DigiLocker callback
      req.session.userIdForDigiLocker = user._id.toString();

      // Prepare the DigiLocker redirect URL
      const state = `${user._id.toString()}-${Math.random().toString(36).substring(2, 15)}`;
      req.session.digilockerState = state; // Store this state to verify in callback

      const digilockerAuthUrl = `${config.digilockerAuthUrl}?response_type=code&client_id=${config.digilockerClientId}&redirect_uri=${config.digilockerRedirectUri}&state=${state}&scope=profile:read documents:read`;

      // Instead of direct response, tell frontend to redirect
      return res.status(200).json({
        message: 'Account verified successfully. Please link your DigiLocker for document verification.',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          digilockerVerified: user.digilockerVerified,
        },
        redirectToDigiLocker: true, // Flag for frontend
        digilockerAuthUrl: digilockerAuthUrl,
      });
    }

    // Standard response for non-drivers or already verified drivers
    res.status(200).json({
      message: 'Account verified successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        digilockerVerified: user.digilockerVerified,
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};

// 🔹 DigiLocker Callback Endpoint
// This endpoint receives the authorization code from DigiLocker
exports.digilockerCallback = async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const userId = req.session.userIdForDigiLocker; // Retrieve stored user ID

  if (error) {
    console.error("DigiLocker Error:", error, error_description);
    // Render a simple error page or redirect to frontend error page
    return res.send(`
      <html><body><p>DigiLocker authentication failed: ${error_description || error}.</p><p>You can close this window and try again from the app.</p></body></html>
    `);
  }

  // Verify the 'state' parameter to prevent CSRF attacks
  if (!req.session.digilockerState || state !== req.session.digilockerState) {
    console.warn("CSRF attempt detected or invalid state parameter.");
    return res.status(403).send(`
      <html><body><p>Security error: Invalid state parameter. Please try again.</p></body></html>
    `);
  }

  if (!userId) {
    console.error("No user ID found in session for DigiLocker callback.");
    return res.status(400).send(`
      <html><body><p>Error: User session expired or invalid. Please try logging in again.</p></body></html>
    `);
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await axios.post(config.digilockerTokenUrl, null, {
      params: {
        code: code,
        client_id: config.digilockerClientId,
        client_secret: config.digilockerClientSecret,
        redirect_uri: config.digilockerRedirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = tokenResponse.data;
    console.log("DigiLocker Access Token obtained.");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send(`
        <html><body><p>User not found. Please try again.</p></body></html>
      `);
    }

    user.digilockerVerified = true;
    // Optional: Store access_token if you need to fetch more documents later
    // user.digilockerAccessToken = access_token;

    // Step 2: Fetch Aadhaar Card (e-Aadhaar)
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
          if (err) { 
            console.error("Error parsing Aadhaar XML:", err);
          } else {
            // Adjust these paths based on the actual XML structure you receive from DigiLocker
            // Example structure from docs might be result.eAadhaar.Uid.$$.text
            // Or result.AuthRes.KycRes.UidData.$.uid
            if (result && result.eAadhaar && result.eAadhaar.Uid) {
                user.aadhaarNumber = result.eAadhaar.Uid; // Example: extract Aadhaar number
            } else if (result && result.AuthRes && result.AuthRes.KycRes && result.AuthRes.KycRes.UidData && result.AuthRes.KycRes.UidData.$) {
                user.aadhaarNumber = result.AuthRes.KycRes.UidData.$.uid; // Another common path
            }
            // You might also extract name, dob, gender, etc. and store them if needed.
            // user.fullName = user.fullName || result.eAadhaar.Name; // Update user name if not set
            // user.phone = user.phone || result.eAadhaar.Mobile; // Update phone if not set
          }
        });
      }
    } catch (aadhaarErr) {
      console.error("Error fetching Aadhaar from DigiLocker:", aadhaarErr.response ? (aadhaarErr.response.data || aadhaarErr.response.statusText) : aadhaarErr.message);
      // Don't fail the whole process if one document fails, just log it.
    }

    // Step 3: Fetch Driving License (from issued documents list)
    try {
      const issuedDocsResponse = await axios.get(config.digilockerIssuedDocumentsUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const issuedDocs = issuedDocsResponse.data.items;

      if (issuedDocs && Array.isArray(issuedDocs)) {
        const dlDoc = issuedDocs.find(doc => doc.doctype === 'DL' || doc.type === 'Driving License'); // Check 'doctype' or 'type'
        if (dlDoc) {
          // DigiLocker often provides the DL number directly in metadata or a token
          // You might need to inspect 'dlDoc' structure.
          // Common fields: 'doctoken', 'docNumber', 'uri'
          if (dlDoc.doctoken) {
            user.drivingLicenseNumber = dlDoc.doctoken;
          } else if (dlDoc.name === 'Driving License' && dlDoc.Attributes && dlDoc.Attributes.DLN) {
            user.drivingLicenseNumber = dlDoc.Attributes.DLN;
          }

          // If you need the actual PDF/image of the DL, you'd use dlDoc.uri with pull_document
          // const dlContentResponse = await axios.get(`${config.digilockerPullDocumentUrl}?uri=${dlDoc.uri}`, {
          //   headers: { 'Authorization': `Bearer ${access_token}` },
          //   responseType: 'arraybuffer' // For binary data
          // });
          // Handle dlContentResponse.data here (e.g., save as file or base64)
        }
      }
    } catch (dlErr) {
      console.error("Error fetching Driving License from DigiLocker:", dlErr.response ? (dlErr.response.data || dlErr.response.statusText) : dlErr.message);
      // Log error, but continue
    }

    await user.save(); // Save the user with updated DigiLocker info

    // Clear session variables related to DigiLocker flow
    delete req.session.digilockerState;
    delete req.session.userIdForDigiLocker;

    // Send a success message to the frontend (e.g., close the popup or redirect parent window)
    res.send(`
      <html>
      <body>
        <p>DigiLocker documents linked successfully! You can close this window.</p>
        <script>
          // Inform the parent window that DigiLocker linking is complete
          if (window.opener) {
            window.opener.postMessage('digilocker-linked-success', '*');
            window.close();
          } else {
            // Fallback for direct access, redirect to dashboard or home
            window.location.href = '/dashboard'; // Or your app's main page
          }
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Error during DigiLocker callback or document fetch:", err.response ? (err.response.data || err.response.statusText) : err.message);
    res.status(500).send(`
      <html><body><p>An error occurred during document linking. Please try again later.</p><p>You can close this window.</p></body></html>
    `);
  }
}; 
