import Lecture from '../models/Lecture.js'
import Course from '../models/Course.js'
import { cloudinary } from '../utils/cloudinary.js'

export const addLecture = async (req, res, next) => {
  try {
    const { title, description, order, isFree } = req.body
    const { courseId } = req.params

    if (!title || !order) {
      return res.status(400).json({
        success: false,
        message: 'Title and order are required'
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lectures to this course'
      })
    }

    const lecture = await Lecture.create({
      title,
      description,
      course: courseId,
      videoUrl: req.file ? req.file.path : '',
      publicId: req.file ? req.file.filename : '',
      order,
      isFree: isFree || false
    })

    await Course.findByIdAndUpdate(courseId, {
      $push: { lectures: lecture._id }
    })

    res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      lecture
    })
  } catch (err) {
    next(err)
  }
}

export const getLectures = async (req, res, next) => {
  try {
    const { courseId } = req.params

    const lectures = await Lecture.find({ course: courseId })
      .sort({ order: 1 })

    res.status(200).json({
      success: true,
      total: lectures.length,
      lectures
    })
  } catch (err) {
    next(err)
  }
}

export const getLectureById = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id)

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    res.status(200).json({
      success: true,
      lecture
    })
  } catch (err) {
    next(err)
  }
}

export const updateLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id)

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    const updatedData = { ...req.body }

    if (req.file) {
      if (lecture.publicId) {
        await cloudinary.uploader.destroy(lecture.publicId, {
          resource_type: 'video'
        })
      }
      updatedData.videoUrl = req.file.path
      updatedData.publicId = req.file.filename
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      lecture: updatedLecture
    })
  } catch (err) {
    next(err)
  }
}

export const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id)

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    if (lecture.publicId) {
      await cloudinary.uploader.destroy(lecture.publicId, {
        resource_type: 'video'
      })
    }

    await Lecture.findByIdAndDelete(req.params.id)

    await Course.findByIdAndUpdate(lecture.course, {
      $pull: { lectures: req.params.id }
    })

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}