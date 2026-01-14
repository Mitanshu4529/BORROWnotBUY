# Database Schema - Borrow, Not Buy

## Collection: Users

```javascript
{
  phone: String (unique, required),           // 10-digit phone
  name: String (required),                    // Full name
  email: String (unique, sparse),             // Optional
  location: {
    type: Point (GeoJSON),                    // For geospatial queries
    coordinates: [longitude, latitude],       // [Number, Number]
    address: String,
    city: String,
    zipCode: String
  },
  profilePicture: String,                     // URL
  trustScore: Number (0-100, default: 50),   // Reputation score
  totalBorrows: Number (default: 0),         // Count of items borrowed
  totalLends: Number (default: 0),           // Count of items lent
  isVerified: Boolean (default: false),       // OTP verified?
  otp: {
    code: String,
    expiresAt: Date
  },
  status: Enum['active', 'suspended', 'deleted'],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- location.coordinates (2dsphere)
```

---

## Collection: Items

```javascript
{
  name: String (required),                     // Item name
  description: String (required),              // Details
  category: Enum[                              // Item category
    'Tools', 'Electronics', 'Outdoor', 
    'Kitchen', 'Sports', 'Furniture', 'Books', 'Other'
  ],
  owner: ObjectId (ref: User, required),      // Owner user ID
  images: [String],                           // Image URLs
  condition: Enum['Like New', 'Good', 'Fair'], // Item condition
  location: {
    type: Point (GeoJSON),
    coordinates: [longitude, latitude],
    address: String
  },
  availability: {
    fromDate: Date,                           // When available
    toDate: Date,                             // Until when available
    maxBorrowDays: Number (default: 14)       // Max borrow duration
  },
  status: Enum['available', 'borrowed', 'unavailable'],
  dailyRate: Number (default: 0),             // Free for MVP
  borrowRequests: [ObjectId] (ref: Borrow),   // Borrow history
  rating: Number (0-5, default: 5),           // Average rating
  reviewCount: Number (default: 0),           // Number of reviews
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- owner
- location.coordinates (2dsphere)
- status
- category
```

---

## Collection: Borrows

```javascript
{
  item: ObjectId (ref: Item, required),       // Item borrowed
  borrower: ObjectId (ref: User, required),   // User borrowing
  lender: ObjectId (ref: User, required),     // Item owner
  
  requestDate: Date (default: now),           // When request created
  borrowDate: Date,                           // When handed over
  returnDate: Date,                           // Planned return
  expectedReturnDate: Date,                   // Expected return
  actualReturnDate: Date,                     // Actual return
  
  status: Enum[
    'pending',      // Waiting for lender approval
    'approved',     // Lender approved
    'rejected',     // Lender rejected
    'active',       // Item with borrower
    'returned',     // Returned to lender
    'overdue',      // Not returned on time
    'cancelled'     // Cancelled by either party
  ],
  
  lenderApproval: {
    status: Enum['pending', 'approved', 'rejected'],
    approvedAt: Date,
    reason: String  // For rejection
  },
  
  borrowerFeedback: {
    rating: Number (1-5),
    comment: String,
    submittedAt: Date
  },
  
  lenderFeedback: {
    rating: Number (1-5),
    comment: String,
    submittedAt: Date
  },
  
  penalty: {
    amount: Number (default: 0),              // Late fees
    reason: String
  },
  
  notes: String,                              // Additional info
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- borrower, lender, item, status
```

---

## Collection: Reviews

```javascript
{
  borrow: ObjectId (ref: Borrow, required), // Associated borrow
  item: ObjectId (ref: Item, required),     // Item reviewed
  
  reviewer: ObjectId (ref: User, required), // Who reviewed
  reviewee: ObjectId (ref: User, required), // Who is reviewed
  
  rating: Number (1-5, required),           // Star rating
  comment: String,                          // Text review
  
  category: Enum[
    'item-condition',
    'communication',
    'timeliness',
    'overall'
  ],
  
  reviewType: Enum[
    'borrower-review',   // Borrower reviews lender
    'lender-review'      // Lender reviews borrower
  ],
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- reviewee
- reviewer
```

---

## Collection: TrustScores

```javascript
{
  user: ObjectId (ref: User, required, unique), // User reference
  
  baseScore: Number (0-100, default: 50),       // Current score
  
  completedBorrows: Number (default: 0),        // Borrows finished
  completedLends: Number (default: 0),          // Lends finished
  onTimeReturns: Number (default: 0),           // Returned on time
  lateReturns: Number (default: 0),             // Returned late
  damageClaims: Number (default: 0),            // Damage complaints
  
  averageRating: Number (0-5, default: 0),      // From reviews
  
  scoreHistory: [
    {
      score: Number,
      reason: String,
      date: Date (default: now)
    }
  ],
  
  lastUpdated: Date (default: now),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- user (unique)
```

---

## Trust Score Algorithm

```
baseScore = 50 (starting point)

Additions:
+ min(completedBorrows × 5, 20)    // Up to +20
+ min(completedLends × 3, 15)      // Up to +15
+ onTimeReturns × 2                // +2 per return
+ (averageRating × 5)              // +5 per rating point

Deductions:
- lateReturns × 3                  // -3 per late return
- damageClaims × 10                // -10 per claim

Final: Clamped between 0-100
```

---

## Geospatial Queries

Items and Users use GeoJSON Point format for location-based searches:

```javascript
{
  type: "Point",
  coordinates: [longitude, latitude]  // GeoJSON standard order
}
```

MongoDB $near query finds items/users within radius (in meters).

---

## Relationships

```
User
├── Items (one-to-many, owner)
├── Borrows (one-to-many, as borrower & lender)
├── Reviews (one-to-many, as reviewer & reviewee)
└── TrustScore (one-to-one)

Item
├── Owner (many-to-one, ref: User)
├── Borrows (one-to-many, ref: Borrow)
└── Reviews (one-to-many, ref: Review)

Borrow
├── Item (many-to-one)
├── Borrower (many-to-one, ref: User)
├── Lender (many-to-one, ref: User)
└── Reviews (one-to-many, ref: Review)

Review
├── Borrow (many-to-one)
├── Item (many-to-one)
├── Reviewer (many-to-one, ref: User)
└── Reviewee (many-to-one, ref: User)

TrustScore
└── User (one-to-one)
```

---

## Constraints & Validation

**User:**
- Phone: Must be 10 digits
- TrustScore: 0-100
- Email: Must be valid format (if provided)

**Item:**
- Name: Required, non-empty
- Category: Must be from predefined list
- MaxBorrowDays: > 0
- Coordinates: Valid lat/long (-90 to 90, -180 to 180)

**Borrow:**
- Cannot borrow own items
- Item must be 'available' status
- expectedReturnDate > borrowDate
- Cannot have multiple active borrows for same item

**Review:**
- Rating: 1-5
- Must be submitted after borrow is 'returned'
- One review per borrow per relationship type

---

## Indexes (Performance)

```javascript
// User
db.users.createIndex({ phone: 1 })
db.users.createIndex({ "location.coordinates": "2dsphere" })

// Item
db.items.createIndex({ owner: 1 })
db.items.createIndex({ "location.coordinates": "2dsphere" })
db.items.createIndex({ status: 1 })
db.items.createIndex({ category: 1 })

// Borrow
db.borrows.createIndex({ borrower: 1 })
db.borrows.createIndex({ lender: 1 })
db.borrows.createIndex({ item: 1 })
db.borrows.createIndex({ status: 1 })

// Review
db.reviews.createIndex({ reviewee: 1 })
db.reviews.createIndex({ reviewer: 1 })

// TrustScore
db.trustScores.createIndex({ user: 1 }, { unique: true })
```
