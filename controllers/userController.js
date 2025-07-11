const User = require('../models/User');

// Get user profile by ID (query param)
exports.getUserProfile = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  try {
    const user = await User.findById(userId).select('-otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile by ID
exports.updateUserProfile = async (req, res) => {
  const {
    userId, fullName, phone, address,
    makeAndModel, licenseNumber, vehicleNumber,
    color, registration, insurance
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        fullName, phone, address, makeAndModel,
        licenseNumber, vehicleNumber, color,
        registration, insurance
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get profile from token (for dashboard)
exports.getUserFromToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user from token:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// === Saved Locations ===

// Get saved locations
exports.getSavedLocations = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId).select('savedLocations');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.savedLocations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching locations' });
  }
};

// Add saved location
exports.addSavedLocation = async (req, res) => {
  const { userId, name, address } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedLocations.push({ name, address });
    await user.save();

    res.status(201).json({ message: 'Location added', locations: user.savedLocations });
  } catch (err) {
    res.status(500).json({ message: 'Error adding location' });
  }
};

// Delete saved location
exports.deleteSavedLocation = async (req, res) => {
  const { userId, name } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedLocations = user.savedLocations.filter(loc => loc.name !== name);
    await user.save();

    res.status(200).json({ message: 'Location removed', locations: user.savedLocations });
  } catch (err) {
    res.status(500).json({ message: 'Error removing location' });
  }
};
