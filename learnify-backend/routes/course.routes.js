import express from 'express'
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublish,
  getMyCourses
} from '../controllers/course.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'
import { uploadImage } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/', getAllCourses)
router.get('/:id', getCourseById)
router.post('/', verifyToken, verifyRole('instructor'), uploadImage.single('thumbnail'), createCourse)
router.put('/:id', verifyToken, verifyRole('instructor', 'admin'), uploadImage.single('thumbnail'), updateCourse)
router.delete('/:id', verifyToken, verifyRole('instructor', 'admin'), deleteCourse)
router.patch('/:id/publish', verifyToken, verifyRole('instructor'), togglePublish)
router.get('/instructor/my-courses', verifyToken, verifyRole('instructor'), getMyCourses)

export default router