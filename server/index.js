import express from 'express'
import cors from 'cors'
import registerRouter from './routes/register.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import tradingRouter from './routes/trading.js'
import { connectDB } from './data/store.js'

const app = express()
const PORT = process.env.PORT || 4000


// CORS configuration for production
const corsOptions = {
	origin: [
		'http://localhost:5173',
		'http://localhost:3000',
		'https://event-trading-website.vercel.app',
		'https://event-trading-website-1.onrender.com',
		'https://eventtrading.vercel.app'
	],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))
app.use(express.json())


// Health check
app.get('/health', (req, res) => {
	res.json({ ok: true, message: 'Server is running' })
})

// Routes
app.use('/api/register', registerRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/trading', tradingRouter)

async function start() {
	await connectDB()
	console.log('Connected to MongoDB')

	app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
}

start().catch(err => {
	console.error('Failed to start server:', err)
	process.exit(1)
})
