import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../utils/axios.js'

export const getAllCourses = createAsyncThunk(
  'course/getAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { search, category, level, sort } = filters
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (level) params.append('level', level)
      if (sort) params.append('sort', sort)
      const res = await axios.get(`/courses?${params}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const getCourseById = createAsyncThunk(
  'course/getById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/courses/${id}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const getMyCourses = createAsyncThunk(
  'course/getMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/courses/instructor/my-courses')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

const courseSlice = createSlice({
  name: 'course',
  initialState: {
    courses: [],
    currentCourse: null,
    myCourses: [],
    loading: false,
    error: null,
    total: 0
  },
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCourses.pending, (state) => {
        state.loading = true
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload.courses
        state.total = action.payload.total
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getCourseById.pending, (state) => {
        state.loading = true
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false
        state.currentCourse = action.payload.course
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.myCourses = action.payload.courses
      })
  }
})

export const { clearCurrentCourse } = courseSlice.actions
export default courseSlice.reducer