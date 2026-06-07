 
import { Router } from 'express'
import {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  cancelJob,
} from '../controllers/job.controller'
import { protect, isCreatorMode } from '../middleware/auth.middleware'

const router = Router()

// Protected routes
router.post('/', protect, isCreatorMode, createJob)
router.get('/', protect, getJobs)
router.get('/my-jobs', protect, isCreatorMode, getMyJobs)
router.get('/:id', protect, getJobById)
router.put('/:id/cancel', protect, isCreatorMode, cancelJob)

export default router