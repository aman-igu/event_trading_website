# 🚀 Quick Start Guide - Event Trading Platform

## ✅ What's Been Built

Your event trading platform now has:

### 🔐 **Authentication System**
- Login & Signup with JWT tokens
- Password hashing with bcrypt
- Role-based access (admin, trader, team-lead)
- Auto-login from saved tokens

### 👨‍💼 **Admin Panel**
- View all teams and members
- See team balances
- Create and manage stocks
- Monitor all trades
- Dashboard with statistics
- Update user balances

### 💹 **Trading System**
- Buy/sell stocks
- Portfolio tracking
- Profit/loss calculations
- Trade history
- Starting balance: ₹10,000 per user

---

## 🏃 How to Run

### 1. Make Sure MongoDB is Running
```bash
# Check if MongoDB service is running
net start MongoDB

# Or if MongoDB not installed as service, run:
# mongod --dbpath C:\path\to\your\data
```

### 2. Start Backend Server
```bash
npm run server
```
Server should start on: **http://localhost:4000**

### 3. Start Frontend (in new terminal)
```bash
npm run dev
```
Frontend should start on: **http://localhost:5173**

---

## 👥 Create Your First Admin User

### Option 1: Signup and Manually Promote to Admin

1. Open the app in browser
2. Click "Sign up"
3. Fill form:
   - Username: `Admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Team: `Admin Team`
4. After signup, connect to MongoDB and run:

```javascript
// In MongoDB Compass or Mongo Shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

5. Logout and login again to see Admin Dashboard

### Option 2: Use API with Backend Code Modification

Temporarily allow role in signup (already done), then use this curl:

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"admin123\",\"team\":\"Admin Team\",\"role\":\"admin\"}"
```

---

## 📋 Step-by-Step Usage

### As Admin:

1. **Login** with admin credentials
2. **Create Stocks:**
   - Go to "Stocks" tab
   - Fill in: Symbol (AAPL), Name (Apple Inc.), Price (150), Category
   - Click "Create"
3. **View Teams:**
   - Go to "Teams" tab
   - See all teams, members, and balances
4. **Monitor Trades:**
   - Go to "Trades" tab
   - See all buy/sell transactions
5. **Dashboard:**
   - See overall statistics
   - View recent trades

### As Trader:

1. **Signup** as regular user (don't specify role)
2. **Check Balance:** ₹10,000 starting balance
3. **Buy Stocks:**
   - Browse available stocks
   - Select quantity
   - Click "Buy"
4. **View Portfolio:**
   - See your holdings
   - Check profit/loss
5. **Sell Stocks:**
   - Select from portfolio
   - Choose quantity
   - Click "Sell"

---

## 🎯 Quick Test Scenario

### Create Test Environment:

1. **Create Admin** (as shown above)

2. **Admin Creates Stocks:**
   ```
   Symbol: AAPL | Name: Apple Inc. | Price: 150 | Category: Technology
   Symbol: GOOGL | Name: Google | Price: 140 | Category: Technology
   Symbol: TSLA | Name: Tesla | Price: 200 | Category: Technology
   ```

3. **Create Traders:**
   ```
   Team Alpha:
   - trader1@example.com (Trader One, password: trader123)
   - trader2@example.com (Trader Two, password: trader123)
   
   Team Beta:
   - trader3@example.com (Trader Three, password: trader123)
   - trader4@example.com (Trader Four, password: trader123)
   ```

4. **Traders Make Trades:**
   - Trader1 buys 10 AAPL
   - Trader2 buys 5 GOOGL
   - Trader3 buys 3 TSLA
   - Update stock prices as admin
   - Traders check profit/loss

5. **Admin Monitors:**
   - View all teams' total balances
   - See all trades in real-time
   - Check dashboard stats

---

## 📁 Project Structure

```
event_trading_website/
├── server/
│   ├── controllers/
│   │   ├── authController.js      ← Signup, Login, JWT
│   │   ├── adminController.js     ← Admin operations
│   │   └── tradingController.js   ← Buy, Sell, Portfolio
│   ├── middleware/
│   │   └── auth.js                ← JWT & role verification
│   ├── routes/
│   │   ├── auth.js                ← /api/auth/*
│   │   ├── admin.js               ← /api/admin/*
│   │   └── trading.js             ← /api/trading/*
│   ├── data/
│   │   └── store.js               ← MongoDB models
│   └── index.js                   ← Express server
├── src/
│   ├── Login.jsx                  ← Login component
│   ├── Signup.jsx                 ← Signup component
│   ├── AdminDashboard.jsx         ← Admin panel
│   ├── TradePanel.jsx             ← Trading interface
│   ├── Home.jsx                   ← Main router
│   └── utils/
│       └── api.js                 ← API helper
├── .env                           ← Environment config
├── AUTH_README.md                 ← Auth documentation
└── ADMIN_TRADING_README.md        ← This guide
```

---

## 🔧 Configuration

### `.env` File:
```env
VITE_API_URL=http://localhost:4000
MONGO_URI=mongodb://127.0.0.1:27017/event-trading
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2026
```

**Important:** Change `JWT_SECRET` before deploying to production!

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem:** Server fails to start, "Failed to connect to MongoDB"
**Solution:** 
- Start MongoDB service: `net start MongoDB`
- Or check if mongod process is running
- Verify MongoDB is installed

### Port 4000 Already in Use
**Problem:** `EADDRINUSE: address already in use :::4000`
**Solution:**
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process
taskkill /F /PID <PID>
```

### Token Expired Error
**Problem:** "Token expired. Please login again."
**Solution:** 
- Tokens expire after 7 days
- Simply logout and login again
- Token is automatically refreshed

### Can't See Admin Dashboard
**Problem:** Logged in but seeing trader panel instead of admin dashboard
**Solution:**
- Check user role in database
- Make sure `role` field is exactly `"admin"` (lowercase)
- Logout and login again after changing role

---

## 📊 Database Collections

Your MongoDB database `event-trading` has these collections:

1. **users** - All registered users
2. **stocks** - Available stocks/assets
3. **trades** - All buy/sell transactions
4. **portfolios** - User stock holdings
5. **activities** - User activity logs

---

## 🎉 You're All Set!

Your event trading platform is ready to use! 

### Next Steps:
1. ✅ Start MongoDB
2. ✅ Start backend server (`npm run server`)
3. ✅ Start frontend (`npm run dev`)
4. ✅ Create admin user
5. ✅ Create some stocks
6. ✅ Invite traders to signup
7. ✅ Start trading!

### Need Help?
- Check `AUTH_README.md` for authentication details
- Check `ADMIN_TRADING_README.md` for API documentation
- All controllers have error handling and logging

---

**Happy Trading! 📈💰**
