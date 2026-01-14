const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const otpService = require('../services/otpService');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// Step 1: Request OTP
const requestOTP = async (req, res) => {
  try {
    const { phone, email, upi } = req.body;

    // Validate phone format
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
    }

    // Generate OTP and expiry
    const otpCode = otpService.generateOTP();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000));

    // Persist OTP to DB (for reliable verification)
    await Otp.create({ phone, code: otpCode, expiresAt });

    let sentBy = [];

    // If SMTP configured and email provided, send email
    if (email && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Your BorrowNotBuy OTP',
          text: `Your OTP code is: ${otpCode}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
        });

        sentBy.push('email');
      } catch (err) {
        console.warn('Email send failed:', err.message);
      }
    }

    // Fallback: send via existing OTP service (e.g., Twilio or mock SMS)
    try {
      const smsSent = await otpService.sendOTP(phone, otpCode);
      if (smsSent) sentBy.push('sms');
    } catch (err) {
      console.warn('SMS send fallback failed:', err.message);
    }

    // For dev/demo: return OTP when no real provider available
    const resp = { message: 'OTP created', phone }; 
    if (!sentBy.length) resp.demoOTP = otpCode;

    res.json(resp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Step 2: Verify OTP and Register/Login
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, location, upi, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Verify against DB-stored OTP
    const otpDoc = await Otp.findOne({ phone, code: otp, used: false, expiresAt: { $gt: new Date() } });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    otpDoc.used = true;
    await otpDoc.save();

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
        email: email || null,
        isVerified: true,
        location: location || {
          type: 'Point',
          coordinates: [0, 0],
        },
      });

      await user.save();
    } else {
      // Existing user - update fields and mark verified
      user.isVerified = true;
      if (location) user.location = location;
      if (upi) user.upi = upi;
      if (email) user.email = email;
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
        email: user.email || null,
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
