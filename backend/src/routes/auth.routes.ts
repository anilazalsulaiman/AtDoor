 
import { Router } from 'express'
import { register, login } from '../controllers/auth.controller'

const router = Router()

// Auth routes
router.post('/register', register)
router.post('/login', login)

export default router