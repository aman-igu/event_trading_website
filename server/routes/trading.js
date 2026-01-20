import express from 'express'
import {
    buyStock,
    sellStock,
    getPortfolio,
    getTradeHistory,
    getTradingSettings
} from '../controllers/tradingController.js'
import { getAllStocks } from '../controllers/adminController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All trading routes require authentication
router.use(authMiddleware)

// Get available stocks
router.get('/stocks', getAllStocks)

// Get trading settings (buy/sell enabled status)
router.get('/settings', getTradingSettings)

// Trading operations
router.post('/buy', buyStock)
router.post('/sell', sellStock)

// Portfolio and history
router.get('/portfolio', getPortfolio)
router.get('/history', getTradeHistory)

export default router
