const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getSavedLocations,
  addSavedLocation,
  deleteSavedLocation,
  getUserFromToken,
} = require('../controllers/userController');

router.get('/profile', getUserProfile); // ?userId=
router.post('/update-profile', updateUserProfile);

router.get('/me', getUserFromToken); // JWT protected

router.get('/locations', getSavedLocations); // ?userId=
router.post('/add-location', addSavedLocation);
router.delete('/remove-location', deleteSavedLocation);

module.exports = router;
