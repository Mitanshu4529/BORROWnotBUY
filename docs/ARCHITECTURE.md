# System Architecture - Borrow, Not Buy

## High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│          Frontend Layer (React + Tailwind)           │
│  - Components, Pages, Services, Context API         │
└────────────────────┬─────────────────────────────────┘
                     │ REST API (JSON over HTTP)
┌────────────────────▼─────────────────────────────────┐
│       Backend Layer (Node.js + Express)              │
│  - Routes, Controllers, Services, Middleware        │
└────────────────────┬─────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼─────────────────────────────────┐
│      Data Layer (MongoDB)                            │
│  - Collections: Users, Items, Borrows, Reviews      │
└──────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **Frontend** | React 18 | Component-based UI |
| | Tailwind CSS | Utility-first styling |
| | Axios | HTTP client |
| | React Router | Client-side routing |
| | Context API | State management |
| **Backend** | Node.js | Runtime environment |
| | Express.js | Web framework |
| | Mongoose | MongoDB ODM |
| | JWT | Token authentication |
| **Database** | MongoDB | NoSQL database |
| | Geospatial | Location queries |
| **DevOps** | Git | Version control |
| | npm | Package manager |
| | Postman | API testing |

---

## Project Structure

### Backend (`/backend`)
```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── env.js             # Environment variables
├── models/
│   ├── User.js            # User schema + OTP
│   ├── Item.js            # Item schema
│   ├── Borrow.js          # Borrow transaction
│   ├── Review.js          # Reviews & ratings
│   └── TrustScore.js      # Trust calculation
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── items.js           # Item CRUD endpoints
│   ├── borrows.js         # Borrow flow endpoints
│   ├── users.js           # User profile endpoints
│   ├── reviews.js         # Review endpoints
│   └── locations.js       # Geolocation endpoints
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── itemController.js  # Item operations
│   ├── borrowController.js # Borrow logic
│   ├── userController.js  # User operations
│   ├── reviewController.js # Review logic
│   └── locationController.js # Location queries
├── middleware/
│   ├── auth.js            # JWT verification
│   └── errorHandler.js    # Error handling
├── services/
│   ├── otpService.js      # OTP generation/validation
│   ├── trustScoreService.js # Trust score calc
│   └── emailService.js    # Email notifications (optional)
├── utils/
│   ├── constants.js       # App constants
│   └── helpers.js         # Utility functions
├── server.js              # Main entry point
├── package.json           # Dependencies
└── .env.example           # Environment template
```

### Frontend (`/frontend`)
```
frontend/
├── public/
│   └── index.html         # Main HTML file
├── src/
│   ├── components/
│   │   ├── Auth/          # Login/Signup components
│   │   ├── Dashboard/     # Dashboard components
│   │   ├── Items/         # Item components
│   │   ├── Borrow/        # Borrow flow components
│   │   ├── Reviews/       # Review components
│   │   ├── Maps/          # Location components
│   │   └── Common/        # Shared components
│   ├── pages/             # Page-level components
│   ├── services/          # API service layer
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React Context
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── App.jsx            # Main App component
│   └── index.js           # React entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
└── tailwind.config.js     # Tailwind config
```

---

## Key Design Patterns

### 1. **Authentication Flow**
```
User Phone Input
    ↓
Request OTP (Backend generates & stores)
    ↓
User enters OTP
    ↓
Verify OTP (Backend validates)
    ↓
Create/Update User (Auto signup if new)
    ↓
Issue JWT Token
    ↓
Store token in localStorage
    ↓
Redirect to Dashboard
```

### 2. **Borrow Request Flow**
```
Borrower finds Item
    ↓
Creates Borrow Request (pending)
    ↓
Lender receives notification
    ↓
Lender Approves/Rejects
    ↓
If Approved → Handover → Status: active
    ↓
Return Item → Status: returned
    ↓
Update Trust Scores
    ↓
Leave Reviews (optional)
```

### 3. **Trust Score Calculation**
```
Transactions → Count
    ↓
Timeliness → Late/On-time returns
    ↓
Ratings → Average review score
    ↓
Penalties → Damage claims
    ↓
Aggregate Formula (0-100 scale)
    ↓
Update User Profile
```

---

## API Architecture

### Request Flow
```
Client HTTP Request
    ↓
CORS Middleware
    ↓
Route Matching
    ↓
Authentication (if required)
    ↓
Validation
    ↓
Controller Logic
    ↓
Database Query (Mongoose)
    ↓
Response Formatting
    ↓
Error Handling (if error)
    ↓
JSON Response to Client
```

### Response Format
```javascript
// Success
{
  message: "Operation successful",
  data: { /* ... */ }
}

// Error
{
  message: "Error description",
  code: "ERROR_CODE"
}
```

---

## Database Strategy

### Indexing
- **Geospatial:** 2dsphere on coordinates for location queries
- **Lookup fields:** user, owner, borrower, lender
- **Status fields:** For filtering active/inactive items
- **Categories:** For search and filtering

### Query Optimization
- Populate only needed fields
- Limit results (50 max)
- Use geospatial index for location
- Cache trust scores (update only after transaction)

### Data Relationships
- **Users** ← owns → **Items**
- **Users** ← creates → **Borrows**
- **Items** ← referenced in → **Borrows**
- **Borrows** ← generates → **Reviews**
- **Users** ← rated by → **Reviews**
- **Users** ← tracked by → **TrustScores**

---

## Security Considerations

### For Hackathon MVP
✅ **Implemented:**
- JWT token-based auth
- Password validation (basic)
- OTP verification
- Protected routes

❌ **Not implemented (production-only):**
- HTTPS/TLS
- Rate limiting
- CSRF protection
- Input sanitization
- SQL injection prevention (N/A - MongoDB)

### Authentication Flow
```
Login → OTP Verification → JWT Token
    ↓
Store token in localStorage
    ↓
Include in Authorization header for protected routes
    ↓
Server verifies token signature
    ↓
Grant access to protected resource
```

---

## Scalability Considerations

### Current (Hackathon)
- Single Node.js process
- Local/Atlas MongoDB
- In-memory OTP storage
- No caching

### Future Improvements
- Redis for caching
- Message queue for notifications
- Load balancing
- Database replication
- CDN for assets
- Rate limiting

---

## Error Handling

### Types of Errors
1. **Validation Errors** (400) → Bad input
2. **Authentication Errors** (401) → Missing/invalid token
3. **Authorization Errors** (403) → Insufficient permissions
4. **Not Found** (404) → Resource doesn't exist
5. **Conflict** (409) → Data integrity issue
6. **Server Errors** (500) → Unexpected issues

### Error Middleware
```javascript
// Catches all errors and formats response
app.use(errorHandler);
```

---

## Performance Metrics (Targets)

| Metric | Target |
|--------|--------|
| Auth Response | < 500ms |
| Item Search | < 1s |
| API Latency | < 200ms |
| Location Query | < 500ms |
| Database Query | < 100ms |

---

## Development Workflow

1. **Local Setup:**
   - MongoDB running locally/Atlas
   - .env files configured
   - npm install (both frontend & backend)

2. **Running:**
   - Backend: `npm run dev` (nodemon)
   - Frontend: `npm start` (React dev server)

3. **Testing:**
   - Postman for API testing
   - Browser DevTools for frontend
   - MongoDB Compass for database

4. **Deployment:**
   - Backend → Heroku/Render/Railway
   - Frontend → Vercel/Netlify
   - Database → MongoDB Atlas

---

## Monitoring & Logging

### Backend Logging
```javascript
console.log(`[${timestamp}] ${method} ${path}`)
```

### Error Tracking
- Console errors logged
- Try-catch blocks in async operations
- Error middleware centralized handling

---

## Key Files to Understand

**Backend Entry Point:** `backend/server.js`
- Sets up Express app
- Connects MongoDB
- Loads routes

**Frontend Entry Point:** `frontend/src/index.js`
- Renders React app
- Loads AuthProvider

**Auth Middleware:** `backend/middleware/auth.js`
- Verifies JWT token
- Attaches user to request

**Auth Context:** `frontend/src/context/AuthContext.jsx`
- Manages login/logout
- Stores token
- Provides user to app
