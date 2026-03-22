import mongoose from 'mongoose'

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  videoUrl: {
    type: String,
    default: ''
  },
  publicId: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  isFree: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model('Lecture', lectureSchema)