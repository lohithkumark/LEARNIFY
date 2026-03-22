import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../utils/axios.js'

export const getMyEnrollments = createAsyncThunk(
  'enrollment/getMyEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/enroll/my-courses')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const enrollInCourse = createAsyncThunk(
  'enrollment/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/enroll/${courseId}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const updateProgress = createAsyncThunk(
  'enrollment/updateProgress',
  async ({ courseId, lectureId }, { rejectWithValue }) => {
    try {
      const res = await axios.put('/enroll/progress', { courseId, lectureId })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: {
    enrollments: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyEnrollments.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyEnrollments.fulfilled, (state, action) => {
        state.loading = false
        state.enrollments = action.payload.enrollments
      })
      .addCase(getMyEnrollments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollments.push(action.payload.enrollment)
      })
  }
})

export default enrollmentSlice.reducer