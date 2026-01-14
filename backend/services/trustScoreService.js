const TrustScore = require('../models/TrustScore');
const Borrow = require('../models/Borrow');
const Review = require('../models/Review');
const User = require('../models/User');

const calculateTrustScore = async (userId) => {
  try {
    let trustScore = await TrustScore.findOne({ user: userId });

    if (!trustScore) {
      trustScore = new TrustScore({ user: userId });
    }

    // Get all completed borrows
    const completedBorrows = await Borrow.find({
      borrower: userId,
      status: 'returned',
    }).countDocuments();

    // Get all completed lends
    const completedLends = await Borrow.find({
      lender: userId,
      status: 'returned',
    }).countDocuments();

    // Get on-time returns
    const onTimeReturns = await Borrow.find({
      borrower: userId,
      status: 'returned',
      actualReturnDate: { $lte: mongoose.Types.ObjectId.Date },
    }).countDocuments();

    // Get late returns
    const lateReturns = completedBorrows - onTimeReturns;

    // Get average rating from reviews
    const reviews = await Review.find({ reviewee: userId });
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    // Calculate score (0-100)
    let score = 50; // Base score
    score += Math.min(completedBorrows * 5, 20); // Up to +20 for borrows
    score += Math.min(completedLends * 3, 15); // Up to +15 for lends
    score += onTimeReturns * 2; // +2 per on-time return
    score -= lateReturns * 3; // -3 per late return
    score += averageRating * 5; // +5 per rating point

    score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

    // Update trust score
    trustScore.completedBorrows = completedBorrows;
    trustScore.completedLends = completedLends;
    trustScore.onTimeReturns = onTimeReturns;
    trustScore.lateReturns = lateReturns;
    trustScore.averageRating = averageRating;
    trustScore.baseScore = score;

    trustScore.scoreHistory.push({
      score: score,
      reason: 'Automatic recalculation',
      date: new Date(),
    });

    await trustScore.save();

    // Update user trust score
    await User.findByIdAndUpdate(userId, { trustScore: score });

    return score;
  } catch (error) {
    console.error('Error calculating trust score:', error);
    throw error;
  }
};

module.exports = {
  calculateTrustScore,
};
