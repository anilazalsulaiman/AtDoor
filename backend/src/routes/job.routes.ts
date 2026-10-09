 
import { Router } from 'express'
import {
  createJob,
  getJobs,
  getMyJobs,
  getMyWork,
  getJobById,
  cancelJob,
  acceptJob,
  proposeStartWork,
  proposeReschedule,
  acceptReschedule,
  proposeExtension,
  acceptExtension,
  proposeMarkDone,
  getJobWorkLogs,
  proposeNegotiation,
  respondNegotiation,
  getNegotiations,
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
router.put('/:id/start', protect, proposeStartWork)
router.put('/:id/reschedule', protect, proposeReschedule)
router.put('/:id/reschedule/accept', protect, acceptReschedule)
router.put('/:id/extend', protect, proposeExtension)
router.put('/:id/extend/accept', protect, acceptExtension)
router.put('/:id/mark-done', protect, proposeMarkDone)
router.get('/:id/work-logs', protect, getJobWorkLogs)
router.get('/:id/negotiations', protect, getNegotiations)
router.put('/:id/negotiate', protect, proposeNegotiation)
router.put('/:id/negotiate/respond', protect, respondNegotiation)

export default router