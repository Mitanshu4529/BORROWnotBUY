const mongoose = require('mongoose');

const trustScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    baseScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    completedBorrows: {
      type: Number,
      default: 0,
    },
    completedLends: {
      type: Number,
      default: 0,
    },
    onTimeReturns: {
      type: Number,
      default: 0,
    },
    lateReturns: {
      type: Number,
      default: 0,
    },
    damageClaims: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    scoreHistory: [
      {
        score: Number,
        reason: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrustScore', trustScoreSchema);
