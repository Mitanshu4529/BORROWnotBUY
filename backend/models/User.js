const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      sparse: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: String,
      city: String,
      zipCode: String,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    upi: {
      type: String,
      default: null,
      sparse: true,
      // basic UPI id validation: allow common formats like name@bank or phone@upi
      match: /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/,
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    totalBorrows: {
      type: Number,
      default: 0,
    },
    totalLends: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password if needed for future enhancement
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
