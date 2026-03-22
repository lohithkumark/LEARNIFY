import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import courseReducer from './slices/courseSlice.js'
import enrollmentReducer from './slices/enrollmentSlice.js'

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
  }
})

export default store