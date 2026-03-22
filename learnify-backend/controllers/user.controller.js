import User from '../models/User.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail price')
      .populate('createdCourses', 'title thumbnail price isPublished')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body

    const updatedData = {}
    if (name) updatedData.name = name
    if (bio) updatedData.bio = bio
    if (req.file) updatedData.avatar = req.file.path

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updatedData,
      { new: true }
    ).select('-password')

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (err) {
    next(err)
  }
}

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'title thumbnail instructor category')

    const totalEnrolled = enrollments.length
    const completedCourses = enrollments.filter(e => e.isCompleted).length
    const inProgressCourses = enrollments.filter(e => !e.isCompleted && e.progress > 0).length
    const notStartedCourses = enrollments.filter(e => e.progress === 0).length

    const avgProgress = totalEnrolled
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
      : 0

    const recentEnrollments = enrollments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)

    res.status(200).json({
      success: true,
      stats: {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        avgProgress
      },
      recentEnrollments,
      enrollments
    })
  } catch (err) {
    next(err)
  }
}

export const getInstructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user.id

    const courses = await Course.find({ instructor: instructorId })
      .populate('lectures')

    const totalCourses = courses.length
    const publishedCourses = courses.filter(c => c.isPublished).length
    const unpublishedCourses = courses.filter(c => !c.isPublished).length
    const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0)
    const totalLectures = courses.reduce((sum, c) => sum + c.lectures.length, 0)

    const totalRevenue = courses.reduce((sum, c) => {
      return sum + (c.price * c.enrolledStudents.length)
    }, 0)

    const ratedCourses = courses.filter(c => c.rating > 0)
    const avgRating = ratedCourses.length
      ? (ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
      : 0

    const courseAnalytics = courses.map(c => ({
      id: c._id,
      title: c.title,
      thumbnail: c.thumbnail,
      students: c.enrolledStudents.length,
      lectures: c.lectures.length,
      revenue: c.price * c.enrolledStudents.length,
      rating: c.rating,
      isPublished: c.isPublished
    }))

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        unpublishedCourses,
        totalStudents,
        totalLectures,
        totalRevenue,
        avgRating
      },
      courseAnalytics
    })
  } catch (err) {
    next(err)
  }
}

export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalInstructors = await User.countDocuments({ role: 'instructor' })
    const totalCourses = await Course.countDocuments()
    const publishedCourses = await Course.countDocuments({ isPublished: true })
    const totalEnrollments = await Enrollment.countDocuments()

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)

    const recentCourses = await Course.find()
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    const topCourses = await Course.find({ isPublished: true })
      .populate('instructor', 'name')
      .sort({ enrolledStudents: -1 })
      .limit(5)

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalEnrollments
      },
      recentUsers,
      recentCourses,
      topCourses
    })
  } catch (err) {
    next(err)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: users.length,
      users
    })
  } catch (err) {
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}