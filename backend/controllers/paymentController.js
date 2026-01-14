const config = require('../config/env');
const Payment = require('../models/Payment');
const Borrow = require('../models/Borrow');
const Notification = require('../models/Notification');

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (err) {
  Razorpay = null;
}

// Create Razorpay order (server-side) - requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
const createOrder = async (req, res) => {
  try {
    const { borrowId, amount, currency = 'INR' } = req.body;
    const borrow = await Borrow.findById(borrowId).populate('lender', 'upi name');
    if (!borrow) return res.status(404).json({ message: 'Borrow not found' });

    // If Razorpay not configured, return mock order data
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !Razorpay) {
      const mockOrder = { id: `order_mock_${Date.now()}`, amount, currency };
      const payment = await Payment.create({ borrow: borrowId, orderId: mockOrder.id, amount, currency, provider: 'mock', payer: req.userId, payee: borrow.lender._id });
      return res.json({ message: 'Mock order created', order: mockOrder, payment });
    }

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const options = { amount: Math.round(amount * 100), currency, receipt: `rcpt_${borrowId}` };
    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({ borrow: borrowId, orderId: order.id, amount, currency, provider: 'razorpay', payer: req.userId, payee: borrow.lender._id });
    res.json({ message: 'Order created', order, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Webhook to handle razorpay payment confirmations
const webhook = async (req, res) => {
  try {
    // If Razorpay not configured, just accept
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(200).json({ message: 'Webhook received (mock)' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = req.rawBody || JSON.stringify(req.body);

    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expected !== signature) return res.status(400).json({ message: 'Invalid signature' });

    const payload = req.body;
    if (payload.event === 'payment.captured' || payload.event === 'payment.failed') {
      const paymentId = payload.payload.payment.entity.id;
      const orderId = payload.payload.payment.entity.order_id;
      const status = payload.event === 'payment.captured' ? 'paid' : 'failed';

      const p = await Payment.findOneAndUpdate({ orderId }, { paymentId, status }, { new: true });
      if (p && status === 'paid') {
        // mark borrow as paid/active
        await Borrow.findByIdAndUpdate(p.borrow, { status: 'active' });
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, webhook };

// Confirm payment after client checkout (Razorpay) or mark mock payments as paid
const confirmPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_order_id) return res.status(400).json({ message: 'order id required' });

    const payment = await Payment.findOne({ orderId: razorpay_order_id }).populate('borrow');
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    // Mock provider: mark as paid directly
    if (payment.provider === 'mock') {
      payment.paymentId = razorpay_payment_id || `mockpay_${Date.now()}`;
      payment.status = 'paid';
      await payment.save();
      // mark borrow active
      await Borrow.findByIdAndUpdate(payment.borrow, { status: 'active' });
      // notify lender
      await Notification.create({ user: payment.payee, type: 'payment_received', data: { paymentId: payment.paymentId, borrow: payment.borrow } });
      await Notification.create({ user: payment.payer, type: 'payment_confirmed', data: { paymentId: payment.paymentId, borrow: payment.borrow } });
      return res.json({ message: 'Mock payment marked paid', payment });
    }

    // For Razorpay provider, verify signature
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(400).json({ message: 'Razorpay not configured on server' });
    const crypto = require('crypto');
    const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (generated !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });

    payment.paymentId = razorpay_payment_id;
    payment.status = 'paid';
    await payment.save();

    // Update borrow status
    await Borrow.findByIdAndUpdate(payment.borrow, { status: 'active' });

    // Notify both parties
    await Notification.create({ user: payment.payee, type: 'payment_received', data: { paymentId: payment.paymentId, borrow: payment.borrow } });
    await Notification.create({ user: payment.payer, type: 'payment_confirmed', data: { paymentId: payment.paymentId, borrow: payment.borrow } });

    res.json({ message: 'Payment verified and recorded', payment });
  } catch (error) {
    console.error('confirmPayment error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, webhook, confirmPayment };
