# Admin Panel & Trading System Documentation

## 🎯 Overview

This system provides a complete admin panel where admins can:
- **View all teams** and their members
- **See team balances** and individual balances
- **Create stocks** that teams can trade
- **Monitor all trades** across the platform
- **View dashboard statistics**

Regular users (traders) can:
- **Buy and sell stocks**
- **View their portfolio**
- **Track profit/loss**
- **See trade history**

---

## 🗂️ Database Models

### 1. User Model (Enhanced)
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  team: String,
  role: String (trader, team-lead, admin),
  balance: Number (default: 10000), // Starting balance
  createdAt: Date
}
```

### 2. Stock Model
```javascript
{
  symbol: String (unique, uppercase),
  name: String,
  description: String,
  currentPrice: Number,
  initialPrice: Number,
  available: Boolean (default: true),
  category: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### 3. Trade Model
```javascript
{
  user: ObjectId (ref: User),
  stock: ObjectId (ref: Stock),
  type: String (buy/sell),
  quantity: Number,
  pricePerUnit: Number,
  totalAmount: Number,
  team: String,
  createdAt: Date
}
```

### 4. Portfolio Model
```javascript
{
  user: ObjectId (ref: User),
  stock: ObjectId (ref: Stock),
  quantity: Number,
  averagePrice: Number,
  team: String
}
```

---

## 🔐 Admin API Endpoints

### Get Dashboard Statistics
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "ok": true,
  "stats": {
    "totalUsers": 15,
    "totalStocks": 8,
    "totalTrades": 45,
    "totalTeams": 3,
    "teams": [...],
    "recentTrades": [...]
  }
}
```

### Get All Teams with Members
```
GET /api/admin/teams
Headers: Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "ok": true,
  "teams": [
    {
      "teamName": "Alpha Team",
      "members": [
        {
          "id": "...",
          "username": "trader1",
          "email": "trader1@example.com",
          "role": "trader",
          "balance": 9500.00,
          "createdAt": "2026-01-01..."
        }
      ],
      "totalBalance": 28500.00,
      "memberCount": 3
    }
  ],
  "totalTeams": 3
}
```

### Get All Users
```
GET /api/admin/users
Headers: Authorization: Bearer <admin_token>
```

### Create Stock (Admin Only)
```
POST /api/admin/stocks
Headers: Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "description": "Technology company",
  "currentPrice": 150.00,
  "category": "technology"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Stock created successfully",
  "stock": {
    "_id": "...",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currentPrice": 150.00,
    "initialPrice": 150.00,
    "available": true,
    "category": "technology"
  }
}
```

### Get All Stocks
```
GET /api/admin/stocks
Headers: Authorization: Bearer <admin_token>
```

### Update Stock Price
```
PUT /api/admin/stocks/:stockId/price
Headers: Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "currentPrice": 155.50
}
```

### Delete Stock
```
DELETE /api/admin/stocks/:stockId
Headers: Authorization: Bearer <admin_token>
```

### Get All Trades
```
GET /api/admin/trades
Headers: Authorization: Bearer <admin_token>
```

### Update User Balance
```
PUT /api/admin/users/:userId/balance
Headers: Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "balance": 15000
}
```

---

## 💹 Trading API Endpoints (For Traders)

### Get Available Stocks
```
GET /api/trading/stocks
Headers: Authorization: Bearer <token>
```

### Buy Stock
```
POST /api/trading/buy
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stockId": "stockObjectId",
  "quantity": 10
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Stock purchased successfully",
  "trade": {
    "type": "buy",
    "quantity": 10,
    "pricePerUnit": 150.00,
    "totalAmount": 1500.00,
    "stock": {
      "symbol": "AAPL",
      "name": "Apple Inc."
    }
  },
  "newBalance": 8500.00,
  "portfolio": {
    "quantity": 10,
    "averagePrice": 150.00
  }
}
```

### Sell Stock
```
POST /api/trading/sell
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stockId": "stockObjectId",
  "quantity": 5
}
```

### Get Portfolio
```
GET /api/trading/portfolio
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "portfolio": [
    {
      "stock": {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "currentPrice": 155.00
      },
      "quantity": 10,
      "averagePrice": 150.00,
      "investedValue": 1500.00,
      "currentValue": 1550.00,
      "profitLoss": 50.00,
      "profitLossPercent": "3.33"
    }
  ],
  "summary": {
    "totalInvested": 1500.00,
    "totalCurrent": 1550.00,
    "totalProfitLoss": 50.00,
    "totalProfitLossPercent": "3.33"
  }
}
```

### Get Trade History
```
GET /api/trading/history
Headers: Authorization: Bearer <token>
```

---

## 👤 User Roles

### 1. Admin
- **Can:**
  - View all teams and members
  - See all user balances
  - Create/delete stocks
  - Update stock prices
  - Monitor all trades
  - Update user balances
  - Access admin dashboard

### 2. Trader (Default)
- **Can:**
  - View available stocks
  - Buy/sell stocks
  - View personal portfolio
  - Track profit/loss
  - See trade history
  - Start with ₹10,000 balance

### 3. Team-Lead
- Currently same as trader
- Can be extended with team-specific permissions

---

## 🚀 Getting Started

### Create Admin User

After signing up, you need to manually set a user as admin in MongoDB:

```javascript
// Using MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { ₹set: { role: "admin", balance: 1000000 } }
)
```

Or create admin directly:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin",
    "email": "admin@example.com",
    "password": "admin123",
    "team": "Admin Team",
    "role": "admin"
  }'
```

### Admin Workflow

1. **Login as Admin** → Redirected to Admin Dashboard
2. **Create Stocks** → Go to "Stocks" tab, fill form
3. **Monitor Teams** → Go to "Teams" tab, see all members and balances
4. **Track Trades** → Go to "Trades" tab, see all transactions
5. **View Stats** → Dashboard tab shows overview

### Trader Workflow

1. **Login as Trader** → See Trading Panel
2. **View Balance** → See current balance in sidebar
3. **Browse Stocks** → View available stocks with prices
4. **Buy Stocks** → Select quantity, confirm purchase
5. **Check Portfolio** → See holdings and profit/loss
6. **Sell Stocks** → Select quantity from portfolio

---

## 💰 Trading Logic

### Buying Stocks
1. User selects stock and quantity
2. System calculates: `totalCost = currentPrice × quantity`
3. Checks if `userBalance >= totalCost`
4. Deducts balance: `newBalance = balance - totalCost`
5. Creates trade record
6. Updates portfolio (or creates new entry)
7. Calculates average price for holdings

### Selling Stocks
1. User selects stock and quantity
2. System checks if user owns enough quantity
3. Calculates: `totalValue = currentPrice × quantity`
4. Adds to balance: `newBalance = balance + totalValue`
5. Creates trade record
6. Reduces portfolio quantity
7. Deletes portfolio entry if quantity reaches 0

### Portfolio Calculations
- **Average Price:** `(totalInvested) / (totalQuantity)`
- **Current Value:** `currentPrice × quantity`
- **Profit/Loss:** `currentValue - investedValue`
- **P/L Percentage:** `((profitLoss / investedValue) × 100)`

---

## 📊 Admin Dashboard Features

### Dashboard Tab
- Total users count
- Total teams count
- Total stocks available
- Total trades executed
- Recent trades list

### Teams Tab
- Team name
- Total team balance (sum of all members)
- Member count
- List of all members with:
  - Username
  - Email
  - Role
  - Individual balance

### Stocks Tab
- Create new stock form with:
  - Symbol (uppercase, unique)
  - Name
  - Price
  - Category
- List of all stocks with:
  - Symbol and name
  - Current price
  - Initial price
  - Category
  - Delete button

### Trades Tab
- Table showing:
  - User who made trade
  - Team name
  - Stock symbol
  - Trade type (BUY/SELL)
  - Quantity
  - Price per unit
  - Total amount
  - Date

---

## 🎨 UI Features

### Admin Dashboard
- ✅ Dark theme with gradient background
- ✅ Tab-based navigation
- ✅ Responsive grid layouts
- ✅ Real-time data loading
- ✅ Color-coded statistics
- ✅ Confirmation dialogs for delete actions

### Trading Panel (Traders)
- User info sidebar
- Balance display
- Stock listing
- Buy/Sell interface
- Portfolio view
- Trade history

---

## 🔒 Security

- **JWT Authentication:** All routes protected
- **Role-based Access:** Admin routes check for admin role
- **Balance Validation:** Can't buy with insufficient funds
- **Quantity Validation:** Can't sell more than owned
- **Price Validation:** Prices must be > 0
- **Email Uniqueness:** Prevents duplicate accounts

---

## 🧪 Testing Examples

### Test Flow

1. **Create Admin**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin",
    "email": "admin@test.com",
    "password": "admin123",
    "team": "Admin",
    "role": "admin"
  }'
```

2. **Create Stock (as Admin)**
```bash
curl -X POST http://localhost:4000/api/admin/stocks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "name": "Google",
    "currentPrice": 140.50,
    "category": "technology"
  }'
```

3. **Create Trader**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Trader1",
    "email": "trader@test.com",
    "password": "trader123",
    "team": "Alpha Team"
  }'
```

4. **Buy Stock (as Trader)**
```bash
curl -X POST http://localhost:4000/api/trading/buy \
  -H "Authorization: Bearer YOUR_TRADER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stockId": "STOCK_OBJECT_ID",
    "quantity": 5
  }'
```

---

## 📝 Notes

- **Starting Balance:** All traders start with ₹10,000
- **Stock Categories:** technology, finance, healthcare, energy
- **Trade History Limit:** Shows last 50 trades per user
- **Admin Trades View:** Shows last 100 trades globally
- **Portfolio Updates:** Automatic on every trade
- **Average Price:** Calculated using weighted average

---

## 🚧 Future Enhancements

- [ ] Real-time price updates (WebSocket)
- [ ] Stock price charts
- [ ] Team leaderboards
- [ ] Trading competitions
- [ ] Advanced analytics
- [ ] Export reports (CSV/PDF)
- [ ] Email notifications on trades
- [ ] Mobile responsive improvements
- [ ] Dark/Light theme toggle
- [ ] Multi-currency support

---

Made with ❤️ for Event Trading Platform
