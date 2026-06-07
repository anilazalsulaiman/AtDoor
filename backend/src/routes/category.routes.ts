 
import { Router } from 'express'
import {
  getCategories,
  searchCategories,
  suggestCategory,
} from '../controllers/category.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Public routes
router.get('/', getCategories)
router.get('/search', searchCategories)

// Protected routes
router.post('/suggest', protect, suggestCategory)

export default router