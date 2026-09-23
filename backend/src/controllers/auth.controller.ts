import { Request, Response } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware'
import prisma from '../config/db'
import { hashPassword, comparePassword } from '../utils/hash'
import { generateToken } from '../utils/jwt'
import { sendSuccess, sendError } from '../utils/response'
import { RegisterInput, LoginInput } from '../types/user.types'

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      password,
      confirmPassword,
      defaultMode,
    }: RegisterInput = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dob || !password) {
      return sendError(res, 'All fields are required', 400)
    }

    // Check passwords match
    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', 400)
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (existingEmail) {
      return sendError(res, 'Email already registered', 400)
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    })
    if (existingPhone) {
      return sendError(res, 'Phone number already registered', 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Get creator and worker roles
    const creatorRole = await prisma.role.findUnique({
      where: { name: 'CREATOR' },
    })
    const workerRole = await prisma.role.findUnique({
      where: { name: 'WORKER' },
    })

    // Build roles to assign based on defaultMode
    const rolesToAssign = []
    if (defaultMode === 'CREATOR' && creatorRole) {
      rolesToAssign.push({ roleId: creatorRole.id })
    } else if (defaultMode === 'WORKER' && workerRole) {
      rolesToAssign.push({ roleId: workerRole.id })
    } else if (defaultMode === 'BOTH' && creatorRole && workerRole) {
      rolesToAssign.push({ roleId: creatorRole.id })
      rolesToAssign.push({ roleId: workerRole.id })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dob: new Date(dob),
        password: hashedPassword,
        defaultMode: defaultMode || null,
        activeMode: defaultMode === 'WORKER' ? 'WORKER' : 'CREATOR',
        userRoles: {
          create: rolesToAssign,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dob: true,
        defaultMode: true,
        activeMode: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = generateToken(user.id)

    return sendSuccess(res, { user, token }, 'Registration successful', 201)
  } catch (error) {
    console.error('Register error:', error)
    return sendError(res, 'Registration failed', 500)
  }
}

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password, rememberMe }: LoginInput = req.body

    if (!emailOrPhone || !password) {
      return sendError(res, 'Email/Phone and password are required', 400)
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    })

    if (!user) {
      return sendError(res, 'Invalid credentials', 401)
    }

    // Check if account is active
    if (!user.isActive) {
      return sendError(res, 'Account is suspended. Please contact support', 403)
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials', 401)
    }

    // Generate token
    const token = generateToken(user.id, rememberMe)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return sendSuccess(
      res,
      { user: userWithoutPassword, token },
      'Login successful'
    )
  } catch (error) {
    console.error('Login error:', error)
    return sendError(res, 'Login failed', 500)
  }
}
// ─────────────────────────────────────────
// SWITCH MODE
// ─────────────────────────────────────────
export const switchMode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { mode } = req.body

    if (!mode || !['CREATOR', 'WORKER'].includes(mode)) {
      return sendError(res, 'Invalid mode. Must be CREATOR or WORKER', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    // Save mode switch history
    await prisma.modeSwitch.create({
      data: {
        userId,
        fromMode: user.activeMode,
        toMode: mode as any,
      },
    })

    // Update active mode in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { activeMode: mode as any },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dob: true,
        defaultMode: true,
        activeMode: true,
        createdAt: true,
      },
    })

    return sendSuccess(res, updatedUser, `Switched to ${mode} mode`)
  } catch (error) {
    console.error('Switch mode error:', error)
    return sendError(res, 'Failed to switch mode', 500)
  }
}