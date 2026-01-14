import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-trading'

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  return mongoose
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  team: { type: String, required: true, trim: true },
  role: { type: String, enum: ['trader', 'admin', 'team-lead'], default: 'trader' },
  // Balance is controlled by team/admin allocations. Default to 0 for new users.
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  side: String,
  asset: String,
  qty: String,
  price: String,
  time: { type: Date, default: Date.now }
}, { timestamps: true })

// Stock/Asset schema - for tradable items
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  currentPrice: { type: Number, required: true, default: 100 },
  initialPrice: { type: Number, required: true, default: 100 },
  available: { type: Boolean, default: true },
  category: { type: String, default: 'general' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

// Trade/Transaction schema - when users buy/sell stocks
const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Portfolio schema - tracks user holdings
const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  quantity: { type: Number, default: 0 },
  averagePrice: { type: Number, default: 0 },
  team: { type: String, required: true }
}, { timestamps: true })

// Create unique index for user-stock combination
portfolioSchema.index({ user: 1, stock: 1 }, { unique: true })

// Trading Card schema - Admin creates cards with stock price modifiers
const tradingCardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  cardType: { type: String, enum: ['bull', 'bear', 'neutral', 'mixed', 'custom'], default: 'custom' },

  // Price modifiers for each stock (array of {stock: stockId, changePercent: number})
  priceModifiers: [{
    stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    stockSymbol: String,
    changeType: { type: String, enum: ['increase', 'decrease', 'same'], required: true },
    changePercent: { type: Number, default: 0 } // Percentage change (+10 for 10% increase, -10 for 10% decrease, 0 for same)
  }],

  isActive: { type: Boolean, default: false },
  activatedAt: { type: Date },
  activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema)
export const Trade = mongoose.models.Trade || mongoose.model('Trade', tradeSchema)
export const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema)
export const TradingCard = mongoose.models.TradingCard || mongoose.model('TradingCard', tradingCardSchema)

export function nowISO() { return new Date().toISOString() }
