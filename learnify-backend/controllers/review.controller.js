import Review from '../models/Review.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'

// ─── ADD REVIEW ──────────────────────────────────────────
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body
    const { courseId } = req.params
    const studentId = req.user.id

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      })
    }

    // check if student is enrolled in this course
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to review it'
      })
    }

    // check if already reviewed
    const existingReview = await Review.findOne({
      student: studentId,
      course: courseId
    })
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      })
    }

    // create review
    const review = await Review.create({
      student: studentId,
      course: courseId,
      rating,
      comment
    })

    // update course rating
    const allReviews = await Review.find({ course: courseId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Course.findByIdAndUpdate(courseId, {
      rating: avgRating.toFixed(1),
      totalReviews: allReviews.length
    })

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET ALL REVIEWS OF A COURSE ─────────────────────────
export const getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: reviews.length,
      reviews
    })
  } catch (err) {
    next(err)
  }
}

// ─── UPDATE REVIEW ───────────────────────────────────────
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    // only the student who wrote it can update
    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      })
    }

    review.rating = rating || review.rating
    review.comment = comment || review.comment
    await review.save()

    // recalculate course rating
    const allReviews = await Review.find({ course: review.course })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Course.findByIdAndUpdate(review.course, {
      rating: avgRating.toFixed(1)
    })

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE REVIEW ───────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      })
    }

    await Review.findByIdAndDelete(req.params.id)

    // recalculate course rating
    const allReviews = await Review.find({ course: review.course })
    const avgRating = allReviews.length
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    await Course.findByIdAndUpdate(review.course, {
      rating: avgRating.toFixed(1),
      totalReviews: allReviews.length
    })

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}