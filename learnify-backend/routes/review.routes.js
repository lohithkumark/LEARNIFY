import express from 'express'
import {
  addReview,
  getCourseReviews,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.get('/:courseId', getCourseReviews)
router.post('/:courseId', verifyToken, verifyRole('student'), addReview)
router.put('/:id', verifyToken, verifyRole('student'), updateReview)
router.delete('/:id', verifyToken, verifyRole('student', 'admin'), deleteReview)

export default router