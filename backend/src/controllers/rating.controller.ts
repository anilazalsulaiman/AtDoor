import { Response } from 'express'
import prisma from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../middleware/auth.middleware'

const buildSummary = (ratings: { stars: number }[]) => {
  const total = ratings.length
  const average = total > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / total : 0
  const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  ratings.forEach((r) => { distribution[r.stars] = (distribution[r.stars] || 0) + 1 })
  return { average: parseFloat(average.toFixed(1)), total, distribution }
}

// ─────────────────────────────────────────
// GET RATINGS SUMMARY — split by role (as Creator / as Worker)
// ─────────────────────────────────────────
export const getRatingsSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string

    // Ratings received AS a creator (given by workers)
    const asCreatorRatings = await prisma.rating.findMany({
      where: { toUserId: parseInt(userId), direction: 'WORKER_TO_CREATOR' },
      select: { stars: true, comment: true, createdAt: true, fromUser: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Ratings received AS a worker (given by creators)
    const asWorkerRatings = await prisma.rating.findMany({
      where: { toUserId: parseInt(userId), direction: 'CREATOR_TO_WORKER' },
      select: { stars: true, comment: true, createdAt: true, fromUser: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return sendSuccess(res, {
      asCreator: { ...buildSummary(asCreatorRatings), recent: asCreatorRatings.slice(0, 10) },
      asWorker: { ...buildSummary(asWorkerRatings), recent: asWorkerRatings.slice(0, 10) },
    }, 'Ratings summary fetched')
  } catch (error) {
    console.error('Get ratings summary error:', error)
    return sendError(res, 'Failed to fetch ratings summary', 500)
  }
}