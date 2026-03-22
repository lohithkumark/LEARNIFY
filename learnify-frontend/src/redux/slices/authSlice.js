import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../utils/axios.js'

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/auth/register', userData)
      localStorage.setItem('token', res.data.token)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/auth/login', userData)
      localStorage.setItem('token', res.data.token)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/auth/me')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer