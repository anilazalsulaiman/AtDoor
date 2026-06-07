 
import { Response } from 'express'
import prisma from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../middleware/auth.middleware'

// ─────────────────────────────────────────
// GET ALL ACTIVE CATEGORIES
// ─────────────────────────────────────────
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        isOfficial: true,
      },
    })
    return sendSuccess(res, categories, 'Categories fetched successfully')
  } catch (error) {
    console.error('Get categories error:', error)
    return sendError(res, 'Failed to fetch categories', 500)
  }
}

// ─────────────────────────────────────────
// SEARCH CATEGORIES (for autocomplete)
// ─────────────────────────────────────────
export const searchCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return sendError(res, 'Search query is required', 400)
    }

    const categories = await prisma.category.findMany({
      where: {
        status: 'ACTIVE',
        name: {
          contains: q,
        },
      },
      orderBy: { name: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        icon: true,
        isOfficial: true,
      },
    })

    return sendSuccess(res, categories, 'Categories fetched successfully')
  } catch (error) {
    console.error('Search categories error:', error)
    return sendError(res, 'Failed to search categories', 500)
  }
}

// ─────────────────────────────────────────
// SUGGEST NEW CATEGORY
// ─────────────────────────────────────────
export const suggestCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { suggestedName } = req.body
    const userId = req.userId!

    if (!suggestedName || suggestedName.trim() === '') {
      return sendError(res, 'Category name is required', 400)
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          contains: suggestedName.trim(),
        },
        status: 'ACTIVE',
      },
    })

    if (existing) {
      return sendError(
        res,
        `Category "${existing.name}" already exists. Please select it.`,
        400
      )
    }

    // Check if already suggested by this user
    const alreadySuggested = await prisma.categorySuggestion.findFirst({
      where: {
        suggestedName: suggestedName.trim(),
        suggestedBy: userId,
        status: 'PENDING',
      },
    })

    if (alreadySuggested) {
      return sendError(
        res,
        'You have already suggested this category. Please wait for admin review.',
        400
      )
    }

    const suggestion = await prisma.categorySuggestion.create({
      data: {
        suggestedName: suggestedName.trim(),
        suggestedBy: userId,
        status: 'PENDING',
      },
    })

    // Notify admin — create notification for admin users
    const admins = await prisma.userRole.findMany({
      where: { role: { name: 'ADMIN' } },
      select: { userId: true },
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.userId,
          title: 'New Category Suggestion',
          message: `A user suggested a new category: "${suggestedName.trim()}"`,
        })),
      })
    }

    return sendSuccess(
      res,
      suggestion,
      'Category suggestion submitted! Your job will be published once approved.',
      201
    )
  } catch (error) {
    console.error('Suggest category error:', error)
    return sendError(res, 'Failed to submit suggestion', 500)
  }
}