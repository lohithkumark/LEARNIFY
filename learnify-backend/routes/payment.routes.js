import express from 'express'
import {
  createOrder,
  verifyPayment,
  getRazorpayKey
} from '../controllers/payment.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.get('/key', getRazorpayKey)
router.post('/order/:courseId', verifyToken, verifyRole('student'), createOrder)
router.post('/verify', verifyToken, verifyRole('student'), verifyPayment)

export default router