import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import courseRoutes from './routes/course.routes.js'
import lectureRoutes from './routes/lecture.routes.js'
import enrollmentRoutes from './routes/enrollment.routes.js'
import reviewRoutes from './routes/review.routes.js'
import userRoutes from './routes/user.routes.js'
import paymentRoutes from './routes/payment.routes.js'

// import all models so mongoose registers them
import './models/User.js'
import './models/Course.js'
import './models/Lecture.js'
import './models/Enrollment.js'
import './models/Review.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.get('/', (req, res) => {
  res.json({ message: 'Learnify API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lectures', lectureRoutes)
app.use('/api/enroll', enrollmentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payment', paymentRoutes)

app.use(errorHandler)

// 404 handler — route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  })
})

const PORT = process.env.PORT || 8000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
