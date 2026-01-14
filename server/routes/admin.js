import express from 'express'
import {
    getAllTeams,
    getAllUsers,
    createStock,
    getAllStocks,
    updateStockPrice,
    deleteStock,
    getAllTrades,
    getDashboardStats,
    updateUserBalance,
    createTeam,
    addMemberToTeam,
    allocateTeamMoney,
    createTradingCard,
    getAllTradingCards,
    activateTradingCard,
    deleteTradingCard
} from '../controllers/adminController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authMiddleware)
router.use(requireRole('admin'))

// Dashboard stats
router.get('/dashboard', getDashboardStats)

// Team management
router.get('/teams', getAllTeams)
router.post('/teams', createTeam)
router.post('/teams/members', addMemberToTeam)
router.post('/teams/allocate', allocateTeamMoney)
router.get('/users', getAllUsers)
router.put('/users/:userId/balance', updateUserBalance)

// Stock management
router.get('/stocks', getAllStocks)
router.post('/stocks', createStock)
router.put('/stocks/:stockId/price', updateStockPrice)
router.delete('/stocks/:stockId', deleteStock)

// Trading Card management
router.get('/cards', getAllTradingCards)
router.post('/cards', createTradingCard)
router.post('/cards/:cardId/activate', activateTradingCard)
router.delete('/cards/:cardId', deleteTradingCard)

// Trade monitoring
router.get('/trades', getAllTrades)

export default router

