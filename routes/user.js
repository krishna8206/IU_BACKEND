// const express = require('express');
// const {
//   getUserProfile,
//   updateUserProfile,
//   getSavedLocations,
//   addSavedLocation,
//   deleteSavedLocation
// } = require('../controllers/user.controller');

// const router = express.Router();

// router.get('/profile', getUserProfile);
// router.put('/profile', updateUserProfile);
// router.get('/locations', getSavedLocations);
// router.post('/locations', addSavedLocation);
// router.delete('/locations', deleteSavedLocation);

// module.exports = router;

// module.exports = router;

const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getSavedLocations,
  addSavedLocation,
  deleteSavedLocation
} = require('../controllers/user.controller');

const router = express.Router();

// Add this optional test route for debugging
router.get('/test', (req, res) => {
  res.send('✅ User route is active');
});

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/locations', getSavedLocations);
router.post('/locations', addSavedLocation);
router.delete('/locations', deleteSavedLocation);

module.exports = router; // ✅ Only this one export
 