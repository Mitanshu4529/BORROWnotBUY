const Review = require('../models/Review');
const Borrow = require('../models/Borrow');
const User = require('../models/User');

// Create review after borrow completion
const createReview = async (req, res) => {
  try {
    const { borrowId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow not found' });
    }

    if (borrow.status !== 'returned') {
      return res.status(400).json({ message: 'Can only review after return' });
    }

    // Check if user is borrower or lender
    const isBorrower = borrow.borrower.toString() === req.userId;
    const isLender = borrow.lender.toString() === req.userId;

    if (!isBorrower && !isLender) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const reviewee = isBorrower ? borrow.lender : borrow.borrower;

    const newReview = new Review({
      borrow: borrowId,
      item: borrow.item,
      reviewer: req.userId,
      reviewee,
      rating,
      comment,
      reviewType: isBorrower ? 'lender-review' : 'borrower-review',
    });

    await newReview.save();

    // Update item rating
    const itemReviews = await Review.find({ item: borrow.item });
    const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    await Item.findByIdAndUpdate(borrow.item, {
      rating: avgRating,
      reviewCount: itemReviews.length,
    });

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name phone trustScore')
      .populate('item', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({
      message: 'Reviews retrieved',
      count: reviews.length,
      averageRating: avgRating.toFixed(2),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
