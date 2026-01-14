# Borrow, Not Buy - Hackathon Project

## 🌍 Project Overview

**Borrow, Not Buy** is a community-driven sustainability platform that converts informal borrowing into a structured, trust-based system. Instead of buying items for one-time or short-term use, users can borrow from their neighbors within a configurable radius.

### Core Mission
Reduce overconsumption and waste by enabling community sharing with built-in trust, accountability, and sustainability impact tracking.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- npm v6+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add MONGODB_URI
npm run dev
```

If you want email OTPs in development or production, set these environment variables in `backend/.env`:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-pass
EMAIL_FROM="Borrow Not Buy <no-reply@example.com>"
```

**Server runs on:** `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

**App runs on:** `http://localhost:3000`

### Test Login
```
Phone: 1234567890
OTP: 123456
```

---

## ✨ Core Features

✅ **OTP-Based Authentication**
- Phone-number-only signup
- Mock OTP for hackathon (demo in console)
- JWT token-based sessions

✅ **Item Listing & Discovery**
- Create items with name, description, category
- View all items or search by category
- Geolocation-based search (within radius)
- Display owner trust score

✅ **Borrow Request Flow**
- Submit borrow request with planned dates
- Lender can approve/reject
- Time-bound borrowing (default: 14 days)
- Automatic late return detection

✅ **Trust Score System**
- Starting score: 50
- +5 per completed borrow
- +2 per on-time return
- -3 per late return
- Weighted by user reviews
- Visible on profiles

✅ **Return & Review**
- Mark items as returned
- Leave ratings (1-5 stars)
- Write feedback comments
- Automatic trust score recalculation

✅ **User Dashboard**
- Real-time stats (trust score, total borrows/lends)
- Active borrow tracking
- Borrow history
- Quick action buttons

---

## 📁 Project Structure

```
borrow-not-buy/
├── backend/                 # Node.js + Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── services/           # Utilities (OTP, Trust Score)
│   ├── middleware/         # Auth, error handling
│   └── server.js          # Entry point
│
├── frontend/               # React + Tailwind UI
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API client layer
│   │   ├── context/       # Auth context
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static files
│
└── docs/                  # Documentation
    ├── API_ROUTES.md      # Complete API reference
    ├── DATABASE_SCHEMA.md # MongoDB schema details
    ├── ARCHITECTURE.md    # System design
    ├── WORKFLOW.md        # User journeys & flowcharts
    ├── MVP_GUIDE.md       # Hackathon shortcuts
    └── JUDGE_PITCH.md     # Demo & talking points
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Items
- `GET /api/items` - List items (with filters)
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create item (auth required)
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Borrows
- `POST /api/borrows` - Request borrow
- `GET /api/borrows/active` - Get active borrows
- `GET /api/borrows/history` - Get borrow history
- `PUT /api/borrows/:id/approve` - Approve/reject
- `PUT /api/borrows/:id/return` - Mark as returned

### Users & Reviews
- `GET /api/users/profile/:userId` - User profile
- `GET /api/users/stats` - Current user stats
- `POST /api/reviews` - Create review
- `GET /api/reviews/:userId` - Get user reviews

### Location
- `GET /api/locations/nearby-items` - Find items within radius
- `GET /api/locations/nearby-users` - Find nearby users

**Full API Documentation:** [docs/API_ROUTES.md](docs/API_ROUTES.md)

---

## 💾 Database Schema

### Collections
1. **Users** - Profile, location, trust score, OTP
2. **Items** - Listing details, owner, availability, ratings
3. **Borrows** - Borrow transactions with status & timeline
4. **Reviews** - User ratings and feedback
5. **TrustScores** - Historical trust score data

**Full Schema:** [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

---

## 🏗️ System Architecture

```
React Frontend (Tailwind CSS)
    ↓ (REST API)
Express.js Backend
    ↓ (Mongoose ODM)
MongoDB Database
```

**Architecture Details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📊 User Workflow

1. **Signup** → Phone OTP verification
2. **Dashboard** → View stats, active borrows, trust score
3. **List Item** → Create new item listing
4. **Search** → Find items by category or location
5. **Request Borrow** → Submit borrow request
6. **Wait for Approval** → Lender reviews and approves
7. **Handover** → Item given to borrower
8. **Return** → Borrower returns item
9. **Review & Rate** → Both leave feedback
10. **Trust Update** → Scores calculated, reputation updated

**Detailed Flowchart:** [docs/WORKFLOW.md](docs/WORKFLOW.md)

---

## 🎯 MVP Features (Hackathon Focus)

✅ Included in MVP:
- OTP authentication
- Item listing & search
- Borrow request/approval
- Return tracking
- Trust score calculation
- User profiles
- Basic reviews

❌ Skipped (Post-hackathon):
- Real email/SMS
- Image uploads
- Payment processing
- Advanced maps
- Video calls
- Complex analytics

**MVP Guide:** [docs/MVP_GUIDE.md](docs/MVP_GUIDE.md)

---

## 🎤 Demo & Pitch

### 3-Minute Elevator Pitch
"Borrow, Not Buy is a community-sharing platform that replaces informal WhatsApp borrowing with a structured, trust-based system. Users can borrow everyday items (tools, electronics, furniture) from neighbors instead of buying them. Our unique trust-scoring algorithm incentivizes responsible behavior. Every completed borrow removes an item from manufacturing, shipping, and packaging—directly reducing waste."

### Live Demo (5 minutes)
1. **Login** with phone + OTP
2. **Create Item** to lend
3. **Search Items** in neighborhood
4. **Request Borrow** from another user
5. **Approve** as lender
6. **Return** and see trust score update

**Judge-Friendly Pitch:** [docs/JUDGE_PITCH.md](docs/JUDGE_PITCH.md)

---

## 🔐 Authentication Flow

1. User enters phone number
2. Backend generates 6-digit OTP
3. User enters OTP (demo: `123456`)
4. Backend verifies and creates/updates user
5. JWT token issued and stored in localStorage
6. Token included in all subsequent API calls
7. Backend verifies token before granting access

---

## 🌍 Sustainability Impact

**Per Borrowed Item:**
- 1 item NOT manufactured
- ~50L of water saved
- ~500g CO2 emissions prevented
- Packaging waste eliminated
- Extended product lifecycle

**With 10,000 borrows:**
- 500 tons of CO2 prevented
- 500,000 liters of water saved
- Community trust rebuilt

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Tailwind | Fast, clean UI |
| Backend | Node.js + Express | Full-stack JavaScript |
| Database | MongoDB + Mongoose | Flexible, geospatial |
| Auth | JWT + OTP | Stateless, secure |
| Maps | Geospatial Index | Location queries |

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OTP_EXPIRY_MINUTES=10
# Razorpay (optional for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# If using Twilio for OTP SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
# Frontend Razorpay key (optional - used for client checkout)
REACT_APP_RAZORPAY_KEY=rzp_test_yourkeyhere
```

---

## 🚀 Deployment

### Backend (Heroku/Render)
```bash
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
vercel
```

---

## 🧪 Local Payment & SMS Setup (Developer)

Follow these steps to test payment flows and SMS in development.

- If you don't have Razorpay keys, the backend provides a mock order flow. Set `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` to empty strings to use mock mode.
- To test the real Razorpay flow:
    1. Create a Razorpay account and get `key_id` and `key_secret`.
    2. Set them in the backend `.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
    3. Optionally set `REACT_APP_RAZORPAY_KEY` in the frontend `.env` for client-side checkout.
    4. Expose your local backend to the internet (for webhook verification) using `ngrok` or similar:

```bash
# expose backend to the internet (example)
ngrok http 5000
```

    5. Configure the Razorpay dashboard webhook to point to `https://<your-ngrok-host>/api/payments/webhook` and set the webhook secret (if applicable).

- SMS / OTP:
    - The project ships with a mocked OTP service for the hackathon demos. To enable Twilio SMS in dev, set the Twilio env vars above and the backend will attempt to send SMS via Twilio.

## 🔁 How to run locally (quick)

1. Start backend

```powershell
cd backend
npm install
cp .env.example .env
# edit .env with MONGODB_URI and optionally Razorpay/Twilio keys
npm run dev
```

2. Start frontend

```powershell
cd frontend
npm install
cp .env.example .env
# edit .env and optionally set REACT_APP_RAZORPAY_KEY
npm start
```

3. Test flow

- Add UPI in Profile (required to list items).
- Create a listing as a lender.
- As another user, request to borrow and choose payment option.
- Lender approves and sets payment/duration.
- For non-cash payments, use `Pay Now` to trigger checkout (mock or Razorpay based on keys).

If you want, I can try to start the dev servers and run a quick smoke test; note: I may be limited if remote terminal commands are rate-limited.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [API_ROUTES.md](docs/API_ROUTES.md) | Complete API reference |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | MongoDB collections |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & tech stack |
| [WORKFLOW.md](docs/WORKFLOW.md) | User journeys & flowcharts |
| [MVP_GUIDE.md](docs/MVP_GUIDE.md) | Hackathon tips & shortcuts |
| [JUDGE_PITCH.md](docs/JUDGE_PITCH.md) | Demo script & talking points |

---

## 🤝 Team Attribution

Built with ❤️ for the InnovateHack Hackathon (48-hour build)

---

## 📄 License

MIT

---

## 💡 Future Enhancements

- Real SMS/Email notifications
- Image uploads & storage
- Payment/insurance integration
- Advanced analytics dashboard
- AI-based recommendations
- Mobile app (React Native)
- Wallet system for micro-transactions
- Community forums & events

---

## 📞 Support

For issues or questions:
1. Check [docs/MVP_GUIDE.md](docs/MVP_GUIDE.md)
2. Review [docs/JUDGE_PITCH.md](docs/JUDGE_PITCH.md) for FAQ
3. Check MongoDB connection in .env
4. Verify backend is running: `http://localhost:5000/health`

---

## 🎯 Key Metrics

| Metric | Target |
|--------|--------|
| Auth Response | < 500ms |
| Item Search | < 1s |
| API Latency | < 200ms |
| Trust Score Update | Real-time |
| Database Query | < 100ms |

---

**Happy borrowing! 🌱**
