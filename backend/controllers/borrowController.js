const Borrow = require('../models/Borrow');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const trustScoreService = require('../services/trustScoreService');
const otpService = require('../services/otpService');
const Otp = require('../models/Otp');

// Request to borrow
const createBorrowRequest = async (req, res) => {
  try {
    const { itemId, borrowDate, returnDate, notes, requestedDurationDays, payment } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is not available for borrowing' });
    }

    if (item.owner.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot borrow your own item' });
    }

    const newBorrow = new Borrow({
      item: itemId,
      borrower: req.userId,
      lender: item.owner,
      borrowDate: borrowDate || new Date(),
      expectedReturnDate: returnDate || new Date(Date.now() + item.availability.maxBorrowDays * 24 * 60 * 60 * 1000),
      notes,
      requestedDurationDays: requestedDurationDays || null,
      payment: payment || {},
    });

    await newBorrow.save();

    // Add to item's borrow requests
    item.borrowRequests.push(newBorrow._id);
    await item.save();

    // Create notification for lender
    try {
      await Notification.create({
        user: item.owner,
        type: 'borrow_request',
        data: {
          borrowId: newBorrow._id,
          itemId: item._id,
          itemName: item.name,
          requester: req.userId,
          requestedDurationDays: newBorrow.requestedDurationDays,
          payment: newBorrow.payment,
        },
      });
    } catch (nerr) {
      console.warn('Failed to create notification:', nerr.message);
    }

    res.status(201).json({
      message: 'Borrow request created successfully',
      borrow: newBorrow,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active borrows for user
const getActiveBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      $or: [{ borrower: req.userId }, { lender: req.userId }],
      status: { $in: ['pending', 'approved', 'active'] },
    })
      .populate('item', 'name category images')
      .populate('borrower', 'name phone trustScore')
      .populate('lender', 'name phone trustScore')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Active borrows retrieved',
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get borrow history
const getBorrowHistory = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      $or: [{ borrower: req.userId }, { lender: req.userId }],
      status: { $in: ['returned', 'rejected', 'cancelled'] },
    })
      .populate('item', 'name category')
      .populate('borrower', 'name phone')
      .populate('lender', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Borrow history retrieved',
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve/Reject borrow request
const approveBorrowRequest = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { approved, reason } = req.body;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrow.lender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (approved) {
      borrow.status = 'approved';
      borrow.lenderApproval.status = 'approved';
      borrow.lenderApproval.approvedAt = new Date();

      // If lender provided override for duration/payment, accept
      if (req.body.approvedDurationDays) borrow.requestedDurationDays = req.body.approvedDurationDays;
      if (req.body.approvedPayment) {
        borrow.payment = { ...borrow.payment, ...req.body.approvedPayment };
      }

      // Update item status to reserved/borrowed depending on flow
      await Item.findByIdAndUpdate(borrow.item, { status: 'borrowed' });
    } else {
      borrow.status = 'rejected';
      borrow.lenderApproval.status = 'rejected';
      borrow.lenderApproval.reason = reason;
    }

    await borrow.save();

    // Notify borrower about decision
    try {
      await Notification.create({
        user: borrow.borrower,
        type: approved ? 'borrow_approved' : 'borrow_rejected',
        data: {
          borrowId: borrow._id,
          itemId: borrow.item,
          approved,
          reason: reason || null,
          payment: borrow.payment,
        },
      });
      // If approved, send OTP to borrower for pickup/verification (mock or Twilio)
      if (approved) {
        try {
          const borrower = await User.findById(borrow.borrower);
          const code = otpService.generateOTP();
          await otpService.sendOTP(borrower.phone, code);
          // Persist OTP record for audit (expires in OTP_EXPIRY_MINUTES)
          const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000));
          await Otp.create({ phone: borrower.phone, code, user: borrower._id, expiresAt });
        } catch (otpErr) {
          console.warn('Failed to send approval OTP:', otpErr.message);
        }
      }
    } catch (nerr) {
      console.warn('Failed to create notification:', nerr.message);
    }

    res.json({ message: approved ? 'Borrow request approved' : 'Borrow request rejected', borrow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark as returned
const markAsReturned = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { condition, comment } = req.body;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow not found' });
    }

    if (borrow.borrower.toString() !== req.userId && borrow.lender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    borrow.actualReturnDate = new Date();
    borrow.status = 'returned';
    borrow.lenderFeedback = { comment };

    // Check if return is late
    if (new Date() > borrow.expectedReturnDate) {
      const daysLate = Math.ceil((new Date() - borrow.expectedReturnDate) / (1000 * 60 * 60 * 24));
      borrow.penalty.amount = daysLate * 5; // $5 per day (mock)
      borrow.penalty.reason = `Late by ${daysLate} days`;
    }

    await borrow.save();

    // Update item status
    await Item.findByIdAndUpdate(borrow.item, { status: 'available' });

    // Update trust scores
    await trustScoreService.calculateTrustScore(borrow.borrower);
    await trustScoreService.calculateTrustScore(borrow.lender);

    res.json({
      message: 'Item marked as returned',
      borrow,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get borrow requests received (people who want to borrow YOUR items)
const getReceivedBorrowRequests = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      lender: req.userId,
      status: { $in: ['pending', 'approved', 'active'] },
    })
      .populate('item', 'name category description')
      .populate('borrower', 'name phone trustScore')
      .populate('lender', 'name phone trustScore')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Received borrow requests retrieved',
      count: borrows.length,
      borrows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBorrowRequest,
  getActiveBorrows,
  getBorrowHistory,
  approveBorrowRequest,
  markAsReturned,
  getReceivedBorrowRequests,
};
