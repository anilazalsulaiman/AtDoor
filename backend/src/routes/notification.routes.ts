 
import { Router } from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/', protect, getNotifications)
router.get('/unread-count', protect, getUnreadCount)
router.put('/:id/read', protect, markAsRead)
router.put('/read-all', protect, markAllAsRead)

export default router