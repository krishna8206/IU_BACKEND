<<<<<<< HEAD
=======
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

>>>>>>> 139f86616ae2512101fbdac92d77035f26df1d89
const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getSavedLocations,
  addSavedLocation,
  deleteSavedLocation
} = require('../controllers/user.controller');

const router = express.Router();

<<<<<<< HEAD
=======
// Add this optional test route for debugging
router.get('/test', (req, res) => {
  res.send('✅ User route is active');
});

>>>>>>> 139f86616ae2512101fbdac92d77035f26df1d89
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/locations', getSavedLocations);
router.post('/locations', addSavedLocation);
router.delete('/locations', deleteSavedLocation);

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router; // ✅ Only this one export
>>>>>>> 139f86616ae2512101fbdac92d77035f26df1d89
