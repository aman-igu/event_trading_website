import express from 'express'
import cors from 'cors'
import registerRouter from './routes/register.js'
import { connectDB } from './data/store.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())


// health


app.use('/api/register', registerRouter)

async function start() {
	await connectDB()
   console.log('Connected to MongoDB')

	app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}` ))
}

start().catch(err => {
	console.error('Failed to start server:', err)
	process.exit(1)
})
