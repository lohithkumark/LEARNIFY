import express from 'express'
import {
  addLecture,
  getLectures,
  getLectureById,
  updateLecture,
  deleteLecture
} from '../controllers/lecture.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'
import { uploadVideo } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/:courseId', getLectures)
router.get('/single/:id', getLectureById)

router.post('/:courseId', verifyToken, verifyRole('instructor'), uploadVideo.single('video'), addLecture)
router.put('/:id', verifyToken, verifyRole('instructor'), uploadVideo.single('video'), updateLecture)
router.delete('/:id', verifyToken, verifyRole('instructor', 'admin'), deleteLecture)

export default router