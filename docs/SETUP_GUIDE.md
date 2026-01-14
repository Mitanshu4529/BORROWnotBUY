# Setup Guide - Borrow, Not Buy

## Prerequisites

- **Node.js v14+** - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas (Free)](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

---

## 1. Backend Setup (30 seconds)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
```bash
cp .env.example .env
```

### Step 3: Configure MongoDB
Edit `backend/.env` and add your MongoDB URI:

**Option A: MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/borrow-not-buy?retryWrites=true&w=majority
```

**Option B: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/borrow-not-buy
```

### Step 4: Run Backend
```bash
npm run dev
```

✅ Backend running on: `http://localhost:5000`

You should see:
```
✅ Server running on http://localhost:5000
📖 API Documentation: http://localhost:5000/api/*
```

---

## 2. Frontend Setup (30 seconds)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Create .env File
```bash
cp .env.example .env
```

(The defaults should work as-is for local development)

### Step 3: Run Frontend
```bash
npm start
```

✅ Frontend running on: `http://localhost:3000`

Browser will auto-open. If not, go to: `http://localhost:3000`

---

## 3. Test the Application (2 minutes)

### Step 1: Open Browser
Go to: `http://localhost:3000`

You should see the login page: **"Borrow, Not Buy"**

### Step 2: Login with Demo Account
```
Phone: 1234567890
Click "Send OTP"
(OTP appears in backend console + in app)
OTP: (copy from console or look in app)
Name: Your Name
Click "Verify & Login"
```

### Step 3: Explore
1. **Dashboard** - See your profile, trust score
2. **List Item** - Create a test item
3. **Search** - Find items (add sample data first)

---

## 4. MongoDB Atlas Setup (If Using Cloud)

### Quick Setup (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free M0 cluster
4. Get connection string:
   - Cluster → Connect → Drivers → Python/Node.js
   - Copy connection string
   - Replace `<password>` and `<dbname>`

### Connection String Format
```
mongodb+srv://yourUsername:yourPassword@cluster-name.mongodb.net/borrow-not-buy?retryWrites=true&w=majority
```

Then add to `backend/.env`:
```env
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@...
```

---

## 5. Sample Data (For Testing)

### Add Sample Users (MongoDB Compass)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with your MongoDB URI
3. Create database: `borrow-not-buy`
4. Insert sample document in `users`:

```javascript
{
  "phone": "9876543210",
  "name": "Alice",
  "trustScore": 85,
  "totalBorrows": 3,
  "totalLends": 4,
  "isVerified": true,
  "status": "active"
}
```

### Add Sample Items

```javascript
{
  "name": "Power Drill",
  "description": "DeWalt cordless, excellent condition",
  "category": "Tools",
  "owner": ObjectId("..."), // Alice's user ID
  "status": "available",
  "rating": 5,
  "location": {
    "type": "Point",
    "coordinates": [-74.0060, 40.7128],
    "address": "New York"
  }
}
```

---

## 6. Test API with Postman (Optional)

### Import Collection
1. Download [Postman](https://www.postman.com/downloads/)
2. Create new collection: "Borrow, Not Buy"
3. Add requests:

#### Request 1: Send OTP
```
POST http://localhost:5000/api/auth/request-otp
Body (JSON):
{
  "phone": "1234567890"
}
```

#### Request 2: Verify OTP
```
POST http://localhost:5000/api/auth/verify-otp
Body (JSON):
{
  "phone": "1234567890",
  "otp": "123456",
  "name": "Test User"
}
```

#### Request 3: Get Items
```
GET http://localhost:5000/api/items
```

#### Request 4: Create Item
```
POST http://localhost:5000/api/items
Header:
  Authorization: Bearer {token_from_request_2}
Body (JSON):
{
  "name": "Drill",
  "description": "Power drill",
  "category": "Tools",
  "condition": "Like New"
}
```

---

## 7. Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# If using local MongoDB, make sure it's running:
# On Windows:
mongod

# On Mac:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in server.js:
const PORT = 5001;
```

### Issue: "CORS error in browser"
**Solution:**
- Make sure backend is running
- Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Restart backend

### Issue: "Token expired / 401 error"
**Solution:**
- Clear localStorage: `localStorage.clear()` in browser console
- Login again with new token

### Issue: "Cannot find module 'mongoose'"
**Solution:**
```bash
cd backend
npm install mongoose
```

---

## 8. File Structure After Setup

```
innovatehack/
├── backend/
│   ├── node_modules/          ← Auto-created by npm install
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   ├── .env                   ← Create this
│   └── .env.example
│
├── frontend/
│   ├── node_modules/          ← Auto-created by npm install
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env                   ← Create this
│   ├── .env.example
│   └── tailwind.config.js
│
├── docs/
│   ├── API_ROUTES.md
│   ├── DATABASE_SCHEMA.md
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   ├── MVP_GUIDE.md
│   └── JUDGE_PITCH.md
│
└── README.md
```

---

## 9. Running Both Services

### Terminal 1 (Backend)
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Terminal 3 (Optional - MongoDB Compass)
- Open MongoDB Compass GUI
- Monitor database in real-time

---

## 10. Quick Validation Checklist

- [ ] Backend terminal shows "✅ Server running"
- [ ] Frontend loads at http://localhost:3000
- [ ] Login page visible
- [ ] Can enter phone number
- [ ] Can request OTP
- [ ] Can see OTP in backend console
- [ ] Can enter OTP and login
- [ ] Dashboard loads after login
- [ ] No red errors in browser console

---

## 11. Development Commands

### Backend
```bash
npm run dev      # Run with nodemon (auto-reload)
npm start        # Run production mode
npm test         # Run tests
```

### Frontend
```bash
npm start        # Start dev server
npm build        # Create production build
npm test         # Run tests
```

---

## 12. Database Indexing (First Time)

For geospatial queries to work, create indexes:

### Using MongoDB Compass
1. Database: `borrow-not-buy`
2. Collection: `items`
3. Indexes tab → Create index
4. Add key: `location.coordinates: "2dsphere"`
5. Click Create

### Or via MongoDB Shell
```javascript
db.items.createIndex({ "location.coordinates": "2dsphere" })
db.users.createIndex({ "location.coordinates": "2dsphere" })
```

---

## 13. Environment Variables Explained

### Backend (.env)
```env
# Database
MONGODB_URI=...              # MongoDB connection string

# JWT
JWT_SECRET=...               # Secret for signing tokens

# Server
PORT=5000                    # Server port
NODE_ENV=development         # Environment mode

# Frontend
FRONTEND_URL=...             # Where frontend is running

# OTP
OTP_EXPIRY_MINUTES=10       # How long OTP is valid
OTP_LENGTH=6                # OTP length (6 digits)
```

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=...  # Backend API URL
```

---

## 14. Common Development Tasks

### Add a New API Endpoint
1. Create controller in `backend/controllers/`
2. Add route in `backend/routes/`
3. Register route in `backend/server.js`
4. Test in Postman

### Add a New React Component
1. Create file in `backend/src/components/`
2. Write React code
3. Import in desired page/component
4. Test in browser

### Add a New Database Field
1. Update Mongoose schema in `backend/models/`
2. No migration needed (MongoDB is flexible)
3. Update any related controllers if needed

---

## 15. Git Workflow (Team Development)

```bash
# Clone repository
git clone <repo-url>

# Create feature branch
git checkout -b feature/new-feature

# Make changes, test locally

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## 16. Deployment (After Hackathon)

### Deploy Backend (Heroku)
```bash
heroku login
heroku create borrow-not-buy-api
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
npm install -g vercel
vercel
# Follow prompts
```

---

## 17. Performance Tips

- Use `npm run dev` during development (hot reload)
- Clear browser cache: Ctrl+Shift+Delete
- Check Network tab in DevTools for slow API calls
- Monitor MongoDB queries in Compass

---

## Support

If stuck:
1. Check `docs/MVP_GUIDE.md` for shortcuts
2. Review error messages carefully
3. Check MongoDB connection
4. Verify .env files are created correctly
5. Restart both terminal windows

---

**You're ready to build! 🚀**
