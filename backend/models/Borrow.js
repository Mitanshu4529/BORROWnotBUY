const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    borrowDate: Date,
    returnDate: Date,
    expectedReturnDate: Date,
    actualReturnDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'returned', 'overdue', 'cancelled'],
      default: 'pending',
    },
    lenderApproval: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedAt: Date,
      reason: String,
    },
    borrowerFeedback: {
      rating: Number, // 1-5
      comment: String,
      submittedAt: Date,
    },
    lenderFeedback: {
      rating: Number, // 1-5
      comment: String,
      submittedAt: Date,
    },
    penalty: {
      amount: {
        type: Number,
        default: 0,
      },
      reason: String,
    },
    notes: String,
    // Payment and request preferences
    requestedDurationDays: {
      type: Number,
      default: null,
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'upi'],
        default: 'cash',
      },
      amount: {
        type: Number,
        default: 0,
      },
      // If borrower provided a UPI for prefilled payment (rare), or lender's UPI stored when creating payment
      upi: String,
      // Razorpay order/payment ids will be stored in Payment model; keep placeholder
      metadata: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Borrow', borrowSchema);
