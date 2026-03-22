import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import User from '../models/User.js'

export const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params
    const studentId = req.user.id

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      })
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    })

    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: studentId }
    })

    await User.findByIdAndUpdate(studentId, {
      $push: { enrolledCourses: courseId }
    })

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      enrollment
    })
  } catch (err) {
    next(err)
  }
}

export const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: enrollments.length,
      enrollments
    })
  } catch (err) {
    next(err)
  }
}

export const updateProgress = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.body
    const studentId = req.user.id

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    })

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    if (enrollment.completedLectures.includes(lectureId)) {
      return res.status(400).json({
        success: false,
        message: 'Lecture already marked as completed'
      })
    }

    enrollment.completedLectures.push(lectureId)

    const course = await Course.findById(courseId).populate('lectures')
    const totalLectures = course.lectures.length
    const completedCount = enrollment.completedLectures.length
    enrollment.progress = Math.round((completedCount / totalLectures) * 100)

    if (enrollment.progress === 100) {
      enrollment.isCompleted = true
      enrollment.completedAt = new Date()
    }

    await enrollment.save()

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted
    })
  } catch (err) {
    next(err)
  }
}

export const getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    }).populate('completedLectures')

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    res.status(200).json({
      success: true,
      enrollment
    })
  } catch (err) {
    next(err)
  }
}

export const checkEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    })

    res.status(200).json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment
    })
  } catch (err) {
    next(err)
  }
}

export const getCourseStudents = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId
    })
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: enrollments.length,
      enrollments
    })
  } catch (err) {
    next(err)
  }
}