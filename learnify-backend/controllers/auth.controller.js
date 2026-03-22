import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all fields' 
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    })

    const token = generateToken(user)

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email' 
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      })
    }

    const token = generateToken(user)

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
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

export const logout = (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  })
}