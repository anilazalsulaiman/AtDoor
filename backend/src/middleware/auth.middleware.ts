 
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import prisma from '../config/db'

export interface AuthRequest extends Request {
  userId?: number
  user?: any
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Not authorized, no token', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        activeMode: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return sendError(res, 'Not authorized', 401)
    }

    req.userId = user.id
    req.user = user
    next()
  } catch (error) {
    return sendError(res, 'Not authorized, invalid token', 401)
  }
}

export const isCreatorMode = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.activeMode !== 'CREATOR') {
    return sendError(res, 'Switch to Creator mode to perform this action', 403)
  }
  next()
}

export const isWorkerMode = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.activeMode !== 'WORKER') {
    return sendError(res, 'Switch to Worker mode to perform this action', 403)
  }
  next()
}