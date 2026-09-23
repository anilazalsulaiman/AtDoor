import { Response } from 'express'
import prisma from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../middleware/auth.middleware'

// ─────────────────────────────────────────
// CREATE JOB
// ─────────────────────────────────────────
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      categoryId,
      suggestedCategoryName,
      budgetMin,
      budgetMax,
      location,
      startTime,
      endTime,
      contactPreference,
      photos,
    } = req.body

    const creatorId = req.userId!

    // Validate required fields
    if (!title || !description || !location || !startTime || !endTime) {
      return sendError(res, 'All required fields must be filled', 400)
    }

    // Must have either categoryId or suggestedCategoryName
    if (!categoryId && !suggestedCategoryName) {
      return sendError(res, 'Please select or suggest a category', 400)
    }

    // Validate times
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()

    if (start < now) {
      return sendError(res, 'Start time cannot be in the past', 400)
    }

    if (end <= start) {
      return sendError(res, 'End time must be after start time', 400)
    }

    let jobStatus: any = 'PUBLISHED'
    let suggestionId: number | null = null

    // Handle suggested category
    if (suggestedCategoryName && !categoryId) {
      // Check if category already exists
      const existing = await prisma.category.findFirst({
        where: {
          name: { contains: suggestedCategoryName.trim() },
          status: 'ACTIVE',
        },
      })

      if (existing) {
        return sendError(
          res,
          `Category "${existing.name}" already exists. Please select it from the list.`,
          400
        )
      }

      // Create suggestion
      const suggestion = await prisma.categorySuggestion.create({
        data: {
          suggestedName: suggestedCategoryName.trim(),
          suggestedBy: creatorId,
          status: 'PENDING',
        },
      })

      suggestionId = suggestion.id
      jobStatus = 'PENDING'

      // Notify admins
      const admins = await prisma.userRole.findMany({
        where: { role: { name: 'ADMIN' } },
        select: { userId: true },
      })

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.userId,
            title: 'New Category Suggestion',
            message: `User suggested new category: "${suggestedCategoryName.trim()}" for a job posting.`,
          })),
        })
      }
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId ? parseInt(categoryId) : null,
        suggestionId: suggestionId,
        creatorId,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        location: location.trim(),
        startTime: start,
        endTime: end,
        status: jobStatus,
        contactPreference: contactPreference || 'CHAT_ONLY',
        photos: photos && photos.length > 0
          ? {
              create: photos.map((url: string) => ({ photoUrl: url })),
            }
          : undefined,
      },
      include: {
        category: true,
        suggestion: true,
        photos: true,
      },
    })

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: creatorId,
        jobId: job.id,
        title: jobStatus === 'PENDING'
          ? '⏳ Job Pending Approval'
          : '✅ Job Published!',
        message: jobStatus === 'PENDING'
          ? `Your job "${title}" is pending category approval. You'll be notified once published.`
          : `Your job "${title}" is now live and visible to workers!`,
      },
    })

    return sendSuccess(
      res,
      job,
      jobStatus === 'PENDING'
        ? 'Job created! Awaiting category approval before publishing.'
        : 'Job posted successfully!',
      201
    )
  } catch (error) {
    console.error('Create job error:', error)
    return sendError(res, 'Failed to create job', 500)
  }
}

// ─────────────────────────────────────────
// GET ALL PUBLISHED JOBS (for workers)
// ─────────────────────────────────────────
export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
   const categoryId = req.query.categoryId as string
const search = req.query.search as string
const page = (req.query.page as string) || '1'
const limit = (req.query.limit as string) || '10'

const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {
      status: 'PUBLISHED',
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId as string)
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { location: { contains: search as string } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, icon: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true },
          },
          photos: {
            take: 1,
            select: { photoUrl: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ])

    return sendSuccess(res, {
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Jobs fetched successfully')
  } catch (error) {
    console.error('Get jobs error:', error)
    return sendError(res, 'Failed to fetch jobs', 500)
  }
}

// ─────────────────────────────────────────
// GET MY JOBS (for creator)
// ─────────────────────────────────────────
export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const creatorId = req.userId!
    const { status } = req.query

    const where: any = { creatorId }
    if (status) where.status = status

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        suggestion: {
          select: { id: true, suggestedName: true, status: true },
        },
        photos: {
          select: { photoUrl: true },
        },
      },
    })

    return sendSuccess(res, jobs, 'My jobs fetched successfully')
  } catch (error) {
    console.error('Get my jobs error:', error)
    return sendError(res, 'Failed to fetch your jobs', 500)
  }
}

// ─────────────────────────────────────────
// GET JOB BY ID
// ─────────────────────────────────────────
export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        suggestion: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        photos: true,
      },
    })

    if (!job) {
      return sendError(res, 'Job not found', 404)
    }

    return sendSuccess(res, job, 'Job fetched successfully')
  } catch (error) {
    console.error('Get job by id error:', error)
    return sendError(res, 'Failed to fetch job', 500)
  }
}

// ─────────────────────────────────────────
// CANCEL JOB (creator only)
// ─────────────────────────────────────────
export const cancelJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const creatorId = req.userId!

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    })

    if (!job) {
      return sendError(res, 'Job not found', 404)
    }

    if (job.creatorId !== creatorId) {
      return sendError(res, 'Not authorized to cancel this job', 403)
    }

    // Cannot cancel after work started
    if (job.status === 'WORK_STARTED') {
      return sendError(res, 'Cannot cancel a job that has already started', 400)
    }

    // Cannot cancel completed or already cancelled jobs
    if (['PAYMENT_COMPLETED', 'CANCELLED', 'EXPIRED'].includes(job.status)) {
      return sendError(res, `Job is already ${job.status.toLowerCase()}`, 400)
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    })

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: creatorId,
        jobId: job.id,
        title: 'Job Cancelled',
        message: `Your job "${job.title}" has been cancelled.`,
      },
    })

    return sendSuccess(res, updatedJob, 'Job cancelled successfully')
  } catch (error) {
    console.error('Cancel job error:', error)
    return sendError(res, 'Failed to cancel job', 500)
  }
}
// ─────────────────────────────────────────
// ACCEPT JOB (worker only)
// ─────────────────────────────────────────
export const acceptJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const workerId = req.userId!

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, firstName: true }
        }
      }
    })

    if (!job) {
      return sendError(res, 'Job not found', 404)
    }

    // Cannot accept own job
    if (job.creatorId === workerId) {
      return sendError(res, 'You cannot accept your own job', 400)
    }

    // Only published jobs can be accepted
    if (job.status !== 'PUBLISHED') {
      return sendError(res, `Job is ${job.status.toLowerCase()} and cannot be accepted`, 400)
    }

   // Update job status and assign worker
const updatedJob = await prisma.job.update({
  where: { id: parseInt(id) },
  data: {
    status: 'WORK_ACCEPTED',
    workerId: workerId,
  },
})

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: job.creatorId,
        jobId: job.id,
        title: '🤝 Worker Accepted Your Job!',
        message: `A worker has accepted your job "${job.title}". Please confirm to proceed.`,
      },
    })

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: workerId,
        jobId: job.id,
        title: '✅ Job Accepted Successfully!',
        message: `You have accepted the job "${job.title}". Waiting for creator confirmation.`,
      },
    })

    return sendSuccess(res, updatedJob, 'Job accepted successfully!')
  } catch (error) {
    console.error('Accept job error:', error)
    return sendError(res, 'Failed to accept job', 500)
  }
}
// ─────────────────────────────────────────
// GET MY WORK (for worker)
// ─────────────────────────────────────────
export const getMyWork = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.userId!
    const { status } = req.query

    const where: any = {
      workerId,
    }
    if (status) where.status = status

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    return sendSuccess(res, jobs, 'My work fetched successfully')
  } catch (error) {
    console.error('Get my work error:', error)
    return sendError(res, 'Failed to fetch your work', 500)
  }
}