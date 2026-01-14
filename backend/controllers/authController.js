const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const otpService = require('../services/otpService');

// Step 1: Request OTP
const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone format
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
    }

    // Generate and send OTP
    const otp = otpService.generateOTP();
    const sent = await otpService.sendOTP(phone, otp);

    if (!sent) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    // For DEMO PURPOSE: Return OTP (remove in production)
    res.json({
      message: 'OTP sent successfully',
      phone,
      demoOTP: otp, // REMOVE IN PRODUCTION
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Step 2: Verify OTP and Register/Login
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, location, upi } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Verify OTP
    const verification = otpService.verifyOTP(phone, otp);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // New user - create account
      if (!name) {
        return res.status(400).json({ message: 'Name is required for new users' });
      }

      user = new User({
        phone,
        name,
        upi: upi || null,
        isVerified: true,
        location: location || {
          type: 'Point',
          coordinates: [0, 0], // Default to origin if no location
        },
      });

      await user.save();
    } else {
      // Existing user - update location and mark verified
      user.isVerified = true;
      if (location) {
        user.location = location;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        trustScore: user.trustScore,
        location: user.location,
        upi: user.upi || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-otp');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address, city, zipCode, latitude, longitude, upi } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (upi !== undefined) updateData.upi = upi || null;
    if (address || city || zipCode) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0],
        address,
        city,
        zipCode,
      };
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestOTP,
  verifyOTP,
  getCurrentUser,
  updateProfile,
};
