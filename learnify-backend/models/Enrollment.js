import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  }],
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  paymentId: {
    type: String,
    default: ''
  }
}, { timestamps: true })

// this prevents a student from enrolling in the same course twice
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

export default mongoose.model('Enrollment', enrollmentSchema)