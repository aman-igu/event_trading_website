import express from 'express'
import { register } from '../controllers/registerController.js'

const router = express.Router()

// POST /api/register
router.post('/', register)

export default router
