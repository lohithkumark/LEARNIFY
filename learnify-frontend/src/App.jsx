import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getMe } from './redux/slices/authSlice.js'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import InstructorDashboard from './pages/InstructorDashboard.jsx'
import WatchCourse from './pages/WatchCourse.jsx'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getMe())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/watch/:id" element={<WatchCourse />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App