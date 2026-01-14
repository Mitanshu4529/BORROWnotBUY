const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    borrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrow',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    category: {
      type: String,
      enum: ['item-condition', 'communication', 'timeliness', 'overall'],
    },
    reviewType: {
      type: String,
      enum: ['borrower-review', 'lender-review'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
