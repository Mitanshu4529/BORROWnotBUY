const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow' },
    orderId: String,
    paymentId: String,
    provider: String, // 'razorpay'
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
