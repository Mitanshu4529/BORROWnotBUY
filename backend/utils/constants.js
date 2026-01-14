const constants = {
  ITEM_CATEGORIES: ['Tools', 'Electronics', 'Outdoor', 'Kitchen', 'Sports', 'Furniture', 'Books', 'Other'],
  ITEM_CONDITIONS: ['Like New', 'Good', 'Fair'],
  ITEM_STATUS: ['available', 'borrowed', 'unavailable'],
  BORROW_STATUS: ['pending', 'approved', 'rejected', 'active', 'returned', 'overdue', 'cancelled'],
  USER_STATUS: ['active', 'suspended', 'deleted'],
  TRUST_SCORE: {
    BASE: 50,
    MAX: 100,
    MIN: 0,
  },
  PENALTIES: {
    LATE_RETURN: 3,
    DAMAGE: 10,
    NON_RETURN: 25,
  },
  REWARDS: {
    ON_TIME_RETURN: 2,
    POSITIVE_REVIEW: 5,
    COMPLETION: 1,
  },
};

module.exports = constants;
