import { Router } from 'express'
import { getRatingsSummary } from '../controllers/rating.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()
router.get('/:userId/summary', protect, getRatingsSummary)

export default router