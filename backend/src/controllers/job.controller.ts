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
  ratings: true,
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
  ratings: true,
},
    })

    return sendSuccess(res, jobs, 'My work fetched successfully')
  } catch (error) {
    console.error('Get my work error:', error)
    return sendError(res, 'Failed to fetch your work', 500)
  }
}
// ─────────────────────────────────────────
// HELPER — determine role on job
// ─────────────────────────────────────────
const getRole = (job: { creatorId: number; workerId: number | null }, userId: number) => {
  if (job.creatorId === userId) return 'CREATOR'
  if (job.workerId === userId) return 'WORKER'
  return null
}

// ─────────────────────────────────────────
// PROPOSE / ACCEPT START WORK
// ─────────────────────────────────────────
export const proposeStartWork = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)
    if (job.status !== 'WORK_ACCEPTED') return sendError(res, 'Job is not ready to start', 400)

    const updateData: any = role === 'CREATOR'
      ? { startAcceptedByCreator: true }
      : { startAcceptedByWorker: true }

    const willBothAccept =
      (role === 'CREATOR' && job.startAcceptedByWorker) ||
      (role === 'WORKER' && job.startAcceptedByCreator)

    if (willBothAccept) {
      updateData.status = 'WORK_STARTED'
      updateData.workStartedAt = new Date()
    }

    const updated = await prisma.job.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    await prisma.jobWorkLog.create({
      data: {
        jobId: job.id,
        type: 'START',
        proposedBy: userId,
        acceptedBy: willBothAccept ? userId : null,
        status: willBothAccept ? 'ACCEPTED' : 'PENDING',
        acceptedAt: willBothAccept ? new Date() : null,
      },
    })

    const otherUserId = role === 'CREATOR' ? job.workerId : job.creatorId
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId: job.id,
          title: willBothAccept ? '▶️ Work Started!' : '⏳ Ready to Start Work',
          message: willBothAccept
            ? `Work has officially started on "${job.title}".`
            : `The other party is ready to start "${job.title}". Please confirm.`,
        },
      })
    }

    return sendSuccess(res, updated, willBothAccept ? 'Work started!' : 'Waiting for other party to accept')
  } catch (error) {
    console.error('Propose start work error:', error)
    return sendError(res, 'Failed to start work', 500)
  }
}

// ─────────────────────────────────────────
// PROPOSE RESCHEDULE
// ─────────────────────────────────────────
export const proposeReschedule = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const { newStartTime, newEndTime } = req.body

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)
    if (!['WORK_ACCEPTED'].includes(job.status)) return sendError(res, 'Cannot reschedule at this stage', 400)
    if (!newStartTime) return sendError(res, 'New start time is required', 400)

    await prisma.jobWorkLog.create({
      data: {
        jobId: job.id,
        type: 'RESCHEDULE',
        proposedBy: userId,
        oldStartTime: job.startTime,
        oldEndTime: job.endTime,
        newStartTime: new Date(newStartTime),
        newEndTime: newEndTime ? new Date(newEndTime) : null,
        status: 'PENDING',
      },
    })

    await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        status: 'RESCHEDULED',
        startAcceptedByCreator: false,
        startAcceptedByWorker: false,
      },
    })

    const otherUserId = role === 'CREATOR' ? job.workerId : job.creatorId
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId: job.id,
          title: '🔄 Reschedule Proposed',
          message: `A new time has been proposed for "${job.title}". Please review and accept.`,
        },
      })
    }

    return sendSuccess(res, null, 'Reschedule proposed. Waiting for other party to accept.')
  } catch (error) {
    console.error('Propose reschedule error:', error)
    return sendError(res, 'Failed to propose reschedule', 500)
  }
}

// ─────────────────────────────────────────
// ACCEPT RESCHEDULE
// ─────────────────────────────────────────
export const acceptReschedule = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)

    const latestLog = await prisma.jobWorkLog.findFirst({
      where: { jobId: job.id, type: 'RESCHEDULE', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
    if (!latestLog) return sendError(res, 'No pending reschedule found', 400)
    if (latestLog.proposedBy === userId) return sendError(res, 'You cannot accept your own proposal', 400)

    await prisma.jobWorkLog.update({
      where: { id: latestLog.id },
      data: { status: 'ACCEPTED', acceptedBy: userId, acceptedAt: new Date() },
    })

    const updated = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        startTime: latestLog.newStartTime!,
        endTime: latestLog.newEndTime || job.endTime,
        status: 'WORK_ACCEPTED',
      },
    })

    await prisma.notification.create({
      data: {
        userId: latestLog.proposedBy,
        jobId: job.id,
        title: '✅ Reschedule Accepted',
        message: `The new time for "${job.title}" has been accepted.`,
      },
    })

    return sendSuccess(res, updated, 'Reschedule accepted')
  } catch (error) {
    console.error('Accept reschedule error:', error)
    return sendError(res, 'Failed to accept reschedule', 500)
  }
}

// ─────────────────────────────────────────
// PROPOSE / ACCEPT EXTENSION
// ─────────────────────────────────────────
export const proposeExtension = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const { newEndTime } = req.body

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)
    if (job.status !== 'WORK_STARTED') return sendError(res, 'Can only extend while work is in progress', 400)
    if (!job.endTime) return sendError(res, 'This job has no end time to extend', 400)
    if (!newEndTime) return sendError(res, 'New end time is required', 400)

    await prisma.jobWorkLog.create({
      data: {
        jobId: job.id,
        type: 'EXTENSION',
        proposedBy: userId,
        oldEndTime: job.endTime,
        newEndTime: new Date(newEndTime),
        status: 'PENDING',
      },
    })

    const otherUserId = role === 'CREATOR' ? job.workerId : job.creatorId
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId: job.id,
          title: '⏱️ Time Extension Proposed',
          message: `An extension has been proposed for "${job.title}". Please review and accept.`,
        },
      })
    }

    return sendSuccess(res, null, 'Extension proposed. Waiting for other party to accept.')
  } catch (error) {
    console.error('Propose extension error:', error)
    return sendError(res, 'Failed to propose extension', 500)
  }
}

export const acceptExtension = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)

    const latestLog = await prisma.jobWorkLog.findFirst({
      where: { jobId: job.id, type: 'EXTENSION', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
    if (!latestLog) return sendError(res, 'No pending extension found', 400)
    if (latestLog.proposedBy === userId) return sendError(res, 'You cannot accept your own proposal', 400)

    await prisma.jobWorkLog.update({
      where: { id: latestLog.id },
      data: { status: 'ACCEPTED', acceptedBy: userId, acceptedAt: new Date() },
    })

    const updated = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { endTime: latestLog.newEndTime! },
    })

    await prisma.notification.create({
      data: {
        userId: latestLog.proposedBy,
        jobId: job.id,
        title: '✅ Extension Accepted',
        message: `The time extension for "${job.title}" has been accepted.`,
      },
    })

    return sendSuccess(res, updated, 'Extension accepted')
  } catch (error) {
    console.error('Accept extension error:', error)
    return sendError(res, 'Failed to accept extension', 500)
  }
}

// ─────────────────────────────────────────
// PROPOSE / ACCEPT MARK AS DONE
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// MARK DONE + RATE (combined, mandatory rating)
// ─────────────────────────────────────────
export const proposeMarkDone = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const { stars, comment } = req.body

    if (!stars || stars < 1 || stars > 5) {
      return sendError(res, 'A rating from 1 to 5 stars is required', 400)
    }

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)
    if (job.status !== 'WORK_STARTED') return sendError(res, 'Job is not in progress', 400)
    const pendingNegotiation = await prisma.jobNegotiation.findFirst({
  where: { jobId: job.id, status: 'PENDING' },
})
if (pendingNegotiation) {
  return sendError(res, 'Accept or decline the pending negotiation request before marking as done', 400)
}
    const direction = role === 'CREATOR' ? 'CREATOR_TO_WORKER' : 'WORKER_TO_CREATOR'
    const toUserId = role === 'CREATOR' ? job.workerId! : job.creatorId

    // Prevent duplicate rating from same direction
    const existingRating = await prisma.rating.findUnique({
      where: { jobId_direction: { jobId: job.id, direction } },
    })
    if (existingRating) {
      return sendError(res, 'You have already marked this job as done and rated', 400)
    }

    await prisma.rating.create({
      data: {
        jobId: job.id,
        fromUserId: userId,
        toUserId,
        direction,
        stars: parseInt(stars),
        comment: comment || null,
      },
    })

    const updateData: any = role === 'CREATOR'
      ? { endAcceptedByCreator: true }
      : { endAcceptedByWorker: true }

    const willBothAccept =
      (role === 'CREATOR' && job.endAcceptedByWorker) ||
      (role === 'WORKER' && job.endAcceptedByCreator)

    if (willBothAccept) {
      updateData.status = 'WORK_ENDED'
      updateData.workEndedAt = new Date()
    }

    const updated = await prisma.job.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    await prisma.jobWorkLog.create({
      data: {
        jobId: job.id,
        type: 'MARK_DONE',
        proposedBy: userId,
        acceptedBy: willBothAccept ? userId : null,
        status: willBothAccept ? 'ACCEPTED' : 'PENDING',
        acceptedAt: willBothAccept ? new Date() : null,
      },
    })

    const otherUserId = role === 'CREATOR' ? job.workerId : job.creatorId
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId: job.id,
          title: willBothAccept ? '✅ Job Completed!' : '⏳ Confirm Work is Done',
          message: willBothAccept
            ? `"${job.title}" has been marked complete by both parties.`
            : `The other party marked "${job.title}" as done and rated you. Please do the same to complete the job.`,
        },
      })
    }

    return sendSuccess(res, updated, willBothAccept ? 'Job completed!' : 'Rating submitted. Waiting for other party.')
  } catch (error) {
    console.error('Mark done error:', error)
    return sendError(res, 'Failed to mark as done', 500)
  }
}

// ─────────────────────────────────────────
// GET JOB WORK LOGS
// ─────────────────────────────────────────
export const getJobWorkLogs = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const logs = await prisma.jobWorkLog.findMany({
      where: { jobId: parseInt(id) },
      orderBy: { createdAt: 'asc' },
    })
    return sendSuccess(res, logs, 'Work logs fetched')
  } catch (error) {
    console.error('Get work logs error:', error)
    return sendError(res, 'Failed to fetch work logs', 500)
  }
}

// ─────────────────────────────────────────
// NEGOTIATION
// ─────────────────────────────────────────
const NEGOTIABLE_STATUSES = ['WORK_ACCEPTED', 'WORK_STARTED']

export const proposeNegotiation = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const amount = parseFloat(req.body.amount)

    if (!amount || amount <= 0) return sendError(res, 'Enter a valid amount', 400)

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)

    if (
      !NEGOTIABLE_STATUSES.includes(job.status) ||
      job.endAcceptedByCreator ||
      job.endAcceptedByWorker
    ) {
      return sendError(res, 'Negotiation is not available at this stage', 400)
    }

    const pending = await prisma.jobNegotiation.findFirst({
      where: { jobId: job.id, status: 'PENDING' },
    })
    if (pending) return sendError(res, 'A negotiation request is already pending', 400)

    const negotiation = await prisma.jobNegotiation.create({
      data: { jobId: job.id, proposedBy: userId, amount },
    })

    const otherUserId = role === 'CREATOR' ? job.workerId : job.creatorId
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId: job.id,
          title: '💬 Negotiation Request',
          message: `A new amount of ₹${amount} was requested for "${job.title}". Please accept or decline.`,
        },
      })
    }

    return sendSuccess(res, negotiation, 'Request sent. Waiting for the other party.')
  } catch (error) {
    console.error('Propose negotiation error:', error)
    return sendError(res, 'Failed to send request', 500)
  }
}

export const respondNegotiation = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const { action } = req.body

    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return sendError(res, 'Action must be ACCEPT or DECLINE', 400)
    }

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)

    const role = getRole(job, userId)
    if (!role) return sendError(res, 'Not authorized', 403)

    if (!NEGOTIABLE_STATUSES.includes(job.status)) {
      return sendError(res, 'Negotiation is not available at this stage', 400)
    }

    const pending = await prisma.jobNegotiation.findFirst({
      where: { jobId: job.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
    if (!pending) return sendError(res, 'No pending request found', 400)
    if (pending.proposedBy === userId) {
      return sendError(res, 'You cannot respond to your own request', 400)
    }

    const accepted = action === 'ACCEPT'

    await prisma.jobNegotiation.update({
      where: { id: pending.id },
      data: {
        status: accepted ? 'ACCEPTED' : 'DECLINED',
        respondedBy: userId,
        respondedAt: new Date(),
      },
    })

    if (accepted) {
      await prisma.job.update({
        where: { id: job.id },
        data: { agreedAmount: pending.amount },
      })
    }

    await prisma.notification.create({
      data: {
        userId: pending.proposedBy,
        jobId: job.id,
        title: accepted ? '✅ Amount Accepted' : '❌ Request Declined',
        message: accepted
          ? `₹${pending.amount} was accepted for "${job.title}".`
          : `Your request of ₹${pending.amount} for "${job.title}" was declined.`,
      },
    })

    return sendSuccess(res, null, accepted ? 'Amount accepted' : 'Request declined')
  } catch (error) {
    console.error('Respond negotiation error:', error)
    return sendError(res, 'Failed to respond', 500)
  }
}

export const getNegotiations = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } })
    if (!job) return sendError(res, 'Job not found', 404)
    if (!getRole(job, userId)) return sendError(res, 'Not authorized', 403)

    const negotiations = await prisma.jobNegotiation.findMany({
      where: { jobId: job.id },
      orderBy: { createdAt: 'desc' },
    })

    return sendSuccess(res, negotiations, 'Negotiations fetched')
  } catch (error) {
    console.error('Get negotiations error:', error)
    return sendError(res, 'Failed to fetch negotiations', 500)
  }
}