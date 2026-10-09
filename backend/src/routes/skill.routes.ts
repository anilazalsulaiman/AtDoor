 
import { Router } from 'express'
import {
  createSkill,
  getMySkills,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  toggleAvailability,
} from '../controllers/skill.controller'
import { protect, isWorkerMode } from '../middleware/auth.middleware'

const router = Router()

router.post('/', protect, isWorkerMode, createSkill)
router.get('/', protect, getAllSkills)
router.get('/my-skills', protect, isWorkerMode, getMySkills)
router.get('/:id', protect, getSkillById)
router.delete('/:id', protect, isWorkerMode, deleteSkill)
router.put('/:id', protect, isWorkerMode, updateSkill)
router.put('/:id/toggle-availability', protect, isWorkerMode, toggleAvailability)

export default router