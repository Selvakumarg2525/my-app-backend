    const express = require('express');
    const authController = require('../controllers/authController');
    const upload = require('../config/multer');
    const router = express.Router();
    const User = require('../models/User');

    // OTP and Authentication Routes
    router.post('/send-otp', authController.sendOtp);
    router.post('/login-captain', authController.loginCaptain);
    router.post('/verify-otp', authController.verifyOtp);
    router.post('/login', authController.loginUser);

    // Registration Routes
    router.post('/register-user', authController.registerBasicUser);  // New basic user registration
    router.post('/register', upload.single('verificationId'), authController.registerUser);  // Existing user registration
    router.post('/register-captain', upload.single('verificationId'), authController.registerUser);  // New captain registration
    router.post('/generate-captain-id', upload.single('verificationId'), authController.generateCaptainId);
    router.post('/update-fcm-token', authController.updateFcmToken);

    router.get('/captains/:captainId', authController.getCaptainDetails);
    // User Management Routes
    router.get('/users', async (req, res) => {
      try {
        const users = await User.find({ userType: 'user' })
          .select('-passkey -verificationId -__v')
          .sort({ createdAt: -1 })
          .limit(5);
        res.json({ success: true, users, count: users.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/captains', async (req, res) => {
      try {
        const captains = await User.find({ userType: 'captain' })
          .select('-passkey -verificationId -__v');
        res.json({ success: true, captains });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/users/:id', async (req, res) => {
      try {
        const user = await User.findById(req.params.id)
          .select('-passkey -verificationId -__v');
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/captains/:id', async (req, res) => {
      try {
        const captain = await User.findOne({
          _id: req.params.id,
          userType: 'captain'
        }).select('-passkey -verificationId -__v');

        if (!captain) {
          return res.status(404).json({ success: false, error: 'Captain not found' });
        }
        res.json({ success: true, captain });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Add these new routes at the bottom of authRoutes.js

    // Update User/Captain
    router.put('/users/:id', async (req, res) => {
      try {
        const { name, shortName, phoneNumber } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          { name, shortName, phoneNumber },
          { new: true }
        ).select('-passkey -verificationId -__v');

        if (!updatedUser) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, user: updatedUser });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
// In authController.js
exports.getCaptainDetails = async (req, res) => {
  try {
    const captain = await User.findOne({
      captainId: req.params.captainId,
      userType: 'captain'
    }).select('-passkey -verificationId -__v');

    if (!captain) {
      return res.status(404).json({
        success: false,
        error: 'Captain not found'
      });
    }

    res.json({
      success: true,
      captain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
    // Delete User/Captain
    router.delete('/users/:id', async (req, res) => {
      try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    module.exports = router;