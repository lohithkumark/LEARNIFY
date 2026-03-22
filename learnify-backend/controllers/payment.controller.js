import Razorpay from 'razorpay'
import crypto from 'crypto'
import dotenv from 'dotenv'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'

dotenv.config()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// ─── CREATE ORDER ─────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    })
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      })
    }

    // if course is free enroll directly
    if (course.price === 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a free course. Enroll directly.'
      })
    }

    // create razorpay order
    let order
    try {
      order = await razorpay.orders.create({
        amount: course.price * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          courseId: courseId.toString(),
          studentId: req.user.id.toString()
        }
      })
    } catch (razorpayErr) {
      console.error('Razorpay order creation failed:', razorpayErr)
      return res.status(500).json({
        success: false,
        message: razorpayErr.error?.description || 'Payment gateway error'
      })
    }

    res.status(200).json({
      success: true,
      order,
      course: {
        id: course._id,
        title: course.title,
        price: course.price
      },
      key: process.env.RAZORPAY_KEY_ID
    })
  } catch (err) {
    console.error('createOrder error:', err.message)
    next(err)
  }
}

// ─── VERIFY PAYMENT ───────────────────────────────────────
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body

    // verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentId: razorpay_payment_id
    })

    // update course enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: req.user.id }
    })

    // update user enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: courseId }
    })

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrolled successfully',
      enrollment
    })
  } catch (err) {
    console.error('verifyPayment error:', err.message)
    next(err)
  }
}

// ─── GET RAZORPAY KEY ──────────────────────────────────────
export const getRazorpayKey = (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  })
}