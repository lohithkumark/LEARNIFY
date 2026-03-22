import express from 'express'
import {
  getProfile,
  updateProfile,
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
  getAllUsers,
  deleteUser
} from '../controllers/user.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'
import { uploadImage } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, uploadImage.single('avatar'), updateProfile)
router.get('/dashboard/student', verifyToken, verifyRole('student'), getStudentDashboard)
router.get('/dashboard/instructor', verifyToken, verifyRole('instructor'), getInstructorDashboard)
router.get('/dashboard/admin', verifyToken, verifyRole('admin'), getAdminDashboard)
router.get('/all', verifyToken, verifyRole('admin'), getAllUsers)
router.delete('/:id', verifyToken, verifyRole('admin'), deleteUser)

export default router