import express from 'express'
import {
  enrollCourse,
  getMyEnrolledCourses,
  updateProgress,
  getEnrollment,
  checkEnrollment,
  getCourseStudents
} from '../controllers/enrollment.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.post('/:courseId', verifyToken, verifyRole('student'), enrollCourse)
router.get('/my-courses', verifyToken, verifyRole('student'), getMyEnrolledCourses)
router.put('/progress', verifyToken, verifyRole('student'), updateProgress)
router.get('/check/:courseId', verifyToken, checkEnrollment)
router.get('/:courseId', verifyToken, getEnrollment)
router.get('/students/:courseId', verifyToken, verifyRole('instructor'), getCourseStudents)

export default router