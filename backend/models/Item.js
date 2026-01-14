const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Tools', 'Electronics', 'Outdoor', 'Kitchen', 'Sports', 'Furniture', 'Books', 'Other'],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [String],
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair'],
      default: 'Good',
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
    },
    availability: {
      fromDate: Date,
      toDate: Date,
      maxBorrowDays: {
        type: Number,
        default: 14,
      },
    },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'unavailable'],
      default: 'available',
    },
    dailyRate: {
      type: Number,
      default: 0, // Free to borrow for MVP
    },
    borrowRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrow',
      },
    ],
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
itemSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Item', itemSchema);
