# REST API Routes - Borrow, Not Buy

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Routes
**Prefix:** `/auth`

### 1. Request OTP
- **Method:** `POST`
- **Endpoint:** `/request-otp`
- **Body:**
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response:**
  ```json
  {
    "message": "OTP sent successfully",
    "phone": "9876543210",
    "demoOTP": "123456"
  }
  ```

### 2. Verify OTP & Login/Signup
- **Method:** `POST`
- **Endpoint:** `/verify-otp`
- **Body:**
  ```json
  {
    "phone": "9876543210",
    "otp": "123456",
    "name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "userId",
      "phone": "9876543210",
      "name": "John Doe",
      "trustScore": 50
    }
  }
  ```

### 3. Get Current User
- **Method:** `GET`
- **Endpoint:** `/me`
- **Auth:** Required (Bearer Token)
- **Response:** User object with all details

### 4. Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/profile`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```

---

## Item Routes
**Prefix:** `/items`

### 1. Get All Items (with filters)
- **Method:** `GET`
- **Endpoint:** `/`
- **Query Params:**
  ```
  ?category=Tools&latitude=40.7128&longitude=-74.0060&radius=50&search=hammer
  ```
- **Response:** Array of items with owner details

### 2. Get Item By ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Response:** Item object with full details and borrow requests

### 3. Create Item
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "Power Drill",
    "description": "Black+Decker cordless drill, like new",
    "category": "Tools",
    "condition": "Like New",
    "maxBorrowDays": 14,
    "address": "123 Main St",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```

### 4. Update Item
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Auth:** Required
- **Body:** (partial update)
  ```json
  {
    "description": "Updated description",
    "status": "available",
    "maxBorrowDays": 7
  }
  ```

### 5. Delete Item
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth:** Required

---

## Borrow Routes
**Prefix:** `/borrows`

### 1. Create Borrow Request
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth:** Required
- **Body:**
  ```json
  {
    "itemId": "itemId123",
    "borrowDate": "2026-01-13",
    "returnDate": "2026-01-27",
    "notes": "Need for home renovation"
  }
  ```

### 2. Get Active Borrows
- **Method:** `GET`
- **Endpoint:** `/active`
- **Auth:** Required
- **Response:** Array of pending/approved/active borrows for user

### 3. Get Borrow History
- **Method:** `GET`
- **Endpoint:** `/history`
- **Auth:** Required
- **Response:** Array of completed/rejected/cancelled borrows

### 4. Approve/Reject Borrow Request
- **Method:** `PUT`
- **Endpoint:** `/:borrowId/approve`
- **Auth:** Required (Lender only)
- **Body:**
  ```json
  {
    "approved": true,
    "reason": "Optional rejection reason"
  }
  ```

### 5. Mark Item as Returned
- **Method:** `PUT`
- **Endpoint:** `/:borrowId/return`
- **Auth:** Required
- **Body:**
  ```json
  {
    "condition": "Good",
    "comment": "Item returned in good condition"
  }
  ```

---

## User Routes
**Prefix:** `/users`

### 1. Get User Profile
- **Method:** `GET`
- **Endpoint:** `/profile/:userId`
- **Response:** User profile with trust score and stats

### 2. Get Current User Stats
- **Method:** `GET`
- **Endpoint:** `/stats`
- **Auth:** Required
- **Response:**
  ```json
  {
    "name": "John Doe",
    "trustScore": 75,
    "totalBorrows": 5,
    "totalLends": 8,
    "isVerified": true,
    "joinedDate": "2026-01-01"
  }
  ```

---

## Review Routes
**Prefix:** `/reviews`

### 1. Create Review
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth:** Required
- **Body:**
  ```json
  {
    "borrowId": "borrowId123",
    "rating": 5,
    "comment": "Great item, very responsive lender",
    "category": "overall"
  }
  ```

### 2. Get User Reviews
- **Method:** `GET`
- **Endpoint:** `/:userId`
- **Response:** Array of reviews for user with average rating

---

## Location Routes
**Prefix:** `/locations`

### 1. Get Nearby Items
- **Method:** `GET`
- **Endpoint:** `/nearby-items`
- **Query Params:**
  ```
  ?latitude=40.7128&longitude=-74.0060&radius=50&category=Tools
  ```

### 2. Get Nearby Users
- **Method:** `GET`
- **Endpoint:** `/nearby-users`
- **Query Params:**
  ```
  ?latitude=40.7128&longitude=-74.0060&radius=50
  ```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Authentication
All protected endpoints require:
```
Header: Authorization: Bearer {token}
```

Token is returned from `/auth/verify-otp` endpoint.

---

## Demo Instructions

1. **Request OTP:** 
   - POST to `/auth/request-otp` with phone `1234567890`
   - Response includes `demoOTP` for testing

2. **Verify OTP:**
   - POST to `/auth/verify-otp` with the demo OTP
   - Get token and user data

3. **Use Token:**
   - Include token in Authorization header for all protected routes

---

## Notes
- All timestamps are in UTC
- Geospatial queries require MongoDB with 2dsphere index
- Radius is in kilometers
- Max items returned: 50 per query
