import { Response } from 'express'
import prisma from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import type { AuthRequest } from '../middleware/auth.middleware'

// ─────────────────────────────────────────
// CREATE SKILL
// ─────────────────────────────────────────
export const createSkill = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.userId!
    const {
      categoryId,
      suggestedCategoryName,
      skillTitle,
      description,
      residenceLocation,
      workingDaysType,
      preferredDays,
      preferredDates,
      preferredTimes,
      preferredLocations,
      workingTypes,
      experienceLevel,
      experienceYears,
      experienceMonths,
      pricingType,
      priceFixed,
      priceMin,
      priceMax,
      languages,
      education,
      projectPreference,
      preferredCommunication,
      aboutDescription,
      portfolioLinks,
      certifications,
    } = req.body

    if (!skillTitle || !description || !residenceLocation) {
      return sendError(res, 'Skill title, description and residence location are required', 400)
    }

    if (!categoryId && !suggestedCategoryName) {
      return sendError(res, 'Please select or suggest a category', 400)
    }

    let finalCategoryId = categoryId ? parseInt(categoryId) : null
    let suggestedName = null

    // Handle suggested category
    if (suggestedCategoryName && !categoryId) {
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

      const suggestion = await prisma.categorySuggestion.create({
        data: {
          suggestedName: suggestedCategoryName.trim(),
          suggestedBy: workerId,
          status: 'PENDING',
        },
      })

      suggestedName = suggestedCategoryName.trim()

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
            message: `User suggested new category: "${suggestedCategoryName.trim()}" for a skill listing.`,
          })),
        })
      }
    }

    const skill = await prisma.skill.create({
      data: {
        workerId,
        categoryId: finalCategoryId,
        suggestedCategoryName: suggestedName,
        skillTitle: skillTitle.trim(),
        description: description.trim(),
        residenceLocation: residenceLocation.trim(),
        workingDaysType: workingDaysType || null,
        preferredDays: preferredDays || undefined,
        preferredDates: preferredDates || undefined,
        preferredTimes: preferredTimes || undefined,
        preferredLocations: preferredLocations || undefined,
        workingTypes: workingTypes || undefined,
        experienceLevel: experienceLevel || null,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        experienceMonths: experienceMonths ? parseInt(experienceMonths) : null,
        pricingType: pricingType || null,
        priceFixed: priceFixed ? parseFloat(priceFixed) : null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        languages: languages || undefined,
        education: education || null,
        projectPreference: projectPreference || null,
        preferredCommunication: preferredCommunication || null,
        aboutDescription: aboutDescription || null,
        portfolioLinks: portfolioLinks && portfolioLinks.length > 0
          ? { create: portfolioLinks.map((url: string) => ({ url })) }
          : undefined,
        certifications: certifications && certifications.length > 0
          ? {
              create: certifications.map((cert: { name: string; issuer?: string }) => ({
                name: cert.name,
                issuer: cert.issuer || null,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        portfolioLinks: true,
        certifications: true,
      },
    })

    return sendSuccess(res, skill, 'Skill profile created successfully!', 201)
  } catch (error) {
    console.error('Create skill error:', error)
    return sendError(res, 'Failed to create skill profile', 500)
  }
}

// ─────────────────────────────────────────
// GET MY SKILLS
// ─────────────────────────────────────────
export const getMySkills = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.userId!

    const skills = await prisma.skill.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        portfolioLinks: true,
        certifications: true,
      },
    })

    return sendSuccess(res, skills, 'Skills fetched successfully')
  } catch (error) {
    console.error('Get my skills error:', error)
    return sendError(res, 'Failed to fetch skills', 500)
  }
}

// ─────────────────────────────────────────
// GET SKILL BY ID
// ─────────────────────────────────────────
export const getSkillById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        portfolioLinks: true,
        certifications: true,
        worker: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
      },
    })

    if (!skill) {
      return sendError(res, 'Skill not found', 404)
    }

    return sendSuccess(res, skill, 'Skill fetched successfully')
  } catch (error) {
    console.error('Get skill by id error:', error)
    return sendError(res, 'Failed to fetch skill', 500)
  }
}

// ─────────────────────────────────────────
// DELETE SKILL
// ─────────────────────────────────────────
export const deleteSkill = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const workerId = req.userId!

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } })

    if (!skill) {
      return sendError(res, 'Skill not found', 404)
    }

    if (skill.workerId !== workerId) {
      return sendError(res, 'Not authorized to delete this skill', 403)
    }

    await prisma.skillPortfolioLink.deleteMany({ where: { skillId: parseInt(id) } })
    await prisma.skillCertification.deleteMany({ where: { skillId: parseInt(id) } })
    await prisma.skill.delete({ where: { id: parseInt(id) } })

    return sendSuccess(res, null, 'Skill deleted successfully')
  } catch (error) {
    console.error('Delete skill error:', error)
    return sendError(res, 'Failed to delete skill', 500)
  }
}

// ─────────────────────────────────────────
// TOGGLE AVAILABILITY
// ─────────────────────────────────────────
export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const workerId = req.userId!

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } })

    if (!skill) {
      return sendError(res, 'Skill not found', 404)
    }

    if (skill.workerId !== workerId) {
      return sendError(res, 'Not authorized', 403)
    }

    const updated = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: { isAvailable: !skill.isAvailable },
    })

    return sendSuccess(res, updated, `Marked as ${updated.isAvailable ? 'Available' : 'Not Available'}`)
  } catch (error) {
    console.error('Toggle availability error:', error)
    return sendError(res, 'Failed to update availability', 500)
  }
}
// ─────────────────────────────────────────
// UPDATE SKILL
// ─────────────────────────────────────────
export const updateSkill = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const workerId = req.userId!

    const existing = await prisma.skill.findUnique({ where: { id: parseInt(id) } })
    if (!existing) return sendError(res, 'Skill not found', 404)
    if (existing.workerId !== workerId) return sendError(res, 'Not authorized', 403)

    const {
      categoryId,
      skillTitle,
      description,
      residenceLocation,
      workingDaysType,
      preferredDays,
      preferredDates,
      preferredTimes,
      preferredLocations,
      workingTypes,
      experienceLevel,
      experienceYears,
      experienceMonths,
      pricingType,
      priceFixed,
      priceMin,
      priceMax,
      languages,
      education,
      projectPreference,
      preferredCommunication,
      aboutDescription,
      portfolioLinks,
      certifications,
    } = req.body

    // Replace portfolio links & certifications cleanly
    await prisma.skillPortfolioLink.deleteMany({ where: { skillId: parseInt(id) } })
    await prisma.skillCertification.deleteMany({ where: { skillId: parseInt(id) } })

    const updated = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: {
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
        skillTitle: skillTitle?.trim(),
        description: description?.trim(),
        residenceLocation: residenceLocation?.trim(),
        workingDaysType: workingDaysType || null,
        preferredDays: preferredDays || undefined,
        preferredDates: preferredDates || undefined,
        preferredTimes: preferredTimes || undefined,
        preferredLocations: preferredLocations || undefined,
        workingTypes: workingTypes || undefined,
        experienceLevel: experienceLevel || null,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        experienceMonths: experienceMonths ? parseInt(experienceMonths) : null,
        pricingType: pricingType || null,
        priceFixed: priceFixed ? parseFloat(priceFixed) : null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        languages: languages || undefined,
        education: education || null,
        projectPreference: projectPreference || null,
        preferredCommunication: preferredCommunication || null,
        aboutDescription: aboutDescription || null,
        portfolioLinks: portfolioLinks && portfolioLinks.length > 0
          ? { create: portfolioLinks.map((url: string) => ({ url })) }
          : undefined,
        certifications: certifications && certifications.length > 0
          ? {
              create: certifications.map((cert: { name: string; issuer?: string }) => ({
                name: cert.name,
                issuer: cert.issuer || null,
              })),
            }
          : undefined,
      },
      include: { category: true, portfolioLinks: true, certifications: true },
    })

    return sendSuccess(res, updated, 'Skill updated successfully!')
  } catch (error) {
    console.error('Update skill error:', error)
    return sendError(res, 'Failed to update skill', 500)
  }
}
// ─────────────────────────────────────────
// GET ALL SKILLS (for creators to browse)
// ─────────────────────────────────────────
export const getAllSkills = async (req: AuthRequest, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string
    const search = req.query.search as string
    const availableOnly = req.query.availableOnly as string
    const page = (req.query.page as string) || '1'
    const limit = (req.query.limit as string) || '10'

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {
      status: 'ACTIVE',
      categoryId: { not: null }, // only show skills with approved categories
    }

    if (categoryId) where.categoryId = parseInt(categoryId)
    if (availableOnly === 'true') where.isAvailable = true

    if (search) {
      where.OR = [
        { skillTitle: { contains: search } },
        { description: { contains: search } },
        { residenceLocation: { contains: search } },
      ]
    }

    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ isAvailable: 'desc' }, { createdAt: 'desc' }],
        include: {
          category: { select: { id: true, name: true, icon: true } },
          worker: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.skill.count({ where }),
    ])

    return sendSuccess(res, {
      skills,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Skills fetched successfully')
  } catch (error) {
    console.error('Get all skills error:', error)
    return sendError(res, 'Failed to fetch skills', 500)
  }
}