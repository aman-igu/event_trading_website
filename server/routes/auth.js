import express from 'express'
import { signup, login, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/signup - Register new user
router.post('/signup', signup)

// POST /api/auth/login - Login user
router.post('/login', login)

// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware, getMe)

export default router
