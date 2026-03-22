import Course from '../models/Course.js'
import User from '../models/User.js'

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, category, level } = req.body

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      })
    }

    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      instructor: req.user.id,
      thumbnail: req.file ? req.file.path : ''
    })

    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id }
    })

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    })
  } catch (err) {
    next(err)
  }
}

export const getAllCourses = async (req, res, next) => {
  try {
    const { category, level, search, sort } = req.query

    let filter = { isPublished: true }

    if (category) filter.category = category
    if (level) filter.level = level
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price-low') sortOption = { price: 1 }
    if (sort === 'price-high') sortOption = { price: -1 }
    if (sort === 'rating') sortOption = { rating: -1 }

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar bio')
      .sort(sortOption)

    res.status(200).json({
      success: true,
      total: courses.length,
      courses
    })
  } catch (err) {
    next(err)
  }
}

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('lectures')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    res.status(200).json({
      success: true,
      course
    })
  } catch (err) {
    next(err)
  }
}

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this course'
      })
    }

    const updatedData = { ...req.body }
    if (req.file) updatedData.thumbnail = req.file.path

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    })
  } catch (err) {
    next(err)
  }
}

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this course'
      })
    }

    await Course.findByIdAndDelete(req.params.id)

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { createdCourses: req.params.id }
    })

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}

export const togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    course.isPublished = !course.isPublished
    await course.save()

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: course.isPublished
    })
  } catch (err) {
    next(err)
  }
}

export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('lectures')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: courses.length,
      courses
    })
  } catch (err) {
    next(err)
  }
}