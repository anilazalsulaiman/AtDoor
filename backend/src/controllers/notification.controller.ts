 
import { Response } from 'express'
import prisma from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../middleware/auth.middleware'

// ─────────────────────────────────────────
// GET ALL NOTIFICATIONS
// ─────────────────────────────────────────
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return sendSuccess(res, notifications, 'Notifications fetched successfully')
  } catch (error) {
    console.error('Get notifications error:', error)
    return sendError(res, 'Failed to fetch notifications', 500)
  }
}

// ─────────────────────────────────────────
// GET UNREAD COUNT
// ─────────────────────────────────────────
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    return sendSuccess(res, { count }, 'Unread count fetched')
  } catch (error) {
    console.error('Get unread count error:', error)
    return sendError(res, 'Failed to fetch unread count', 500)
  }
}

// ─────────────────────────────────────────
// MARK ONE AS READ
// ─────────────────────────────────────────
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const id = req.params.id as string

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    })

    if (!notification) {
      return sendError(res, 'Notification not found', 404)
    }

    if (notification.userId !== userId) {
      return sendError(res, 'Not authorized', 403)
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    })

    return sendSuccess(res, null, 'Marked as read')
  } catch (error) {
    console.error('Mark as read error:', error)
    return sendError(res, 'Failed to mark as read', 500)
  }
}

// ─────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return sendSuccess(res, null, 'All notifications marked as read')
  } catch (error) {
    console.error('Mark all as read error:', error)
    return sendError(res, 'Failed to mark all as read', 500)
  }
}