const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getSavedLocations,
  addSavedLocation,
  deleteSavedLocation
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/locations', getSavedLocations);
router.post('/locations', addSavedLocation);
router.delete('/locations', deleteSavedLocation);

module.exports = router;
