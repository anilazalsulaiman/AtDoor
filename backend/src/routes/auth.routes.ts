import { Router } from 'express'
import { register, login, switchMode } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Auth routes
router.post('/register', register)
router.post('/login', login)
router.put('/switch-mode', protect, switchMode)

export default router