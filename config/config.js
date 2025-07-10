require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,


  digilockerClientId: process.env.DIGILOCKER_CLIENT_ID,
  digilockerClientSecret: process.env.DIGILOCKER_CLIENT_SECRET,
  digilockerRedirectUri: process.env.DIGILOCKER_REDIRECT_URI,
  digilockerAuthUrl: 'https://partners.apisetu.gov.in/public/oauth2/1/authorize',
  digilockerTokenUrl: 'https://partners.apisetu.gov.in/public/oauth2/1/token',
  digilockerIssuedDocumentsUrl: 'https://partners.apisetu.gov.in/public/api/1/user/issued_documents',
  digilockerAadhaarUrl: 'https://partners.apisetu.gov.in/public/api/1/user/eaadhaar',
  digilockerPullDocumentUrl: 'https://partners.apisetu.gov.in/public/api/1/user/pull_document',
};