 
import { Router } from 'express'
import {
  createJob,
  getJobs,
  getMyJobs,
  getMyWork,
  getJobById,
  cancelJob,
  acceptJob,
} from '../controllers/job.controller'
import { protect, isCreatorMode, isWorkerMode } from '../middleware/auth.middleware'

const router = Router()

// Protected routes
router.post('/', protect, isCreatorMode, createJob)
router.get('/', protect, getJobs)
router.get('/my-jobs', protect, isCreatorMode, getMyJobs)
router.get('/my-work', protect, isWorkerMode, getMyWork)
router.get('/:id', protect, getJobById)
router.put('/:id/cancel', protect, isCreatorMode, cancelJob)
router.put('/:id/accept', protect, isWorkerMode, acceptJob)

export default router