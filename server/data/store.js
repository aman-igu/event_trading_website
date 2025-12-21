import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-trading'

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  return mongoose
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true },
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

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)

export function nowISO() { return new Date().toISOString() }
