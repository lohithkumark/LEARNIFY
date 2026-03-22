import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, clearError } from '../redux/slices/authSlice.js'
import { toast } from 'react-toastify'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })

  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard')
      else if (user.role === 'instructor') navigate('/instructor/dashboard')
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(registerUser(formData))
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join Learnify and start learning today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I want to</label>
            <div style={styles.roleContainer}>
              <div
                style={formData.role === 'student' ? styles.roleActive : styles.role}
                onClick={() => setFormData({ ...formData, role: 'student' })}
              >
                <span style={styles.roleIcon}>🎓</span>
                <span style={styles.roleText}>Learn</span>
                <span style={styles.roleSubText}>I am a student</span>
              </div>
              <div
                style={formData.role === 'instructor' ? styles.roleActive : styles.role}
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
              >
                <span style={styles.roleIcon}>👨‍🏫</span>
                <span style={styles.roleText}>Teach</span>
                <span style={styles.roleSubText}>I am an instructor</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5'
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '6px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '28px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#444'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  role: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '10px',
    border: '2px solid #ddd',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  roleActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '10px',
    border: '2px solid #4f46e5',
    background: '#eef2ff',
    cursor: 'pointer'
  },
  roleIcon: {
    fontSize: '28px',
    marginBottom: '6px'
  },
  roleText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  roleSubText: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px'
  },
  button: {
    padding: '13px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '6px'
  },
  buttonDisabled: {
    padding: '13px',
    background: '#a5b4fc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '6px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666'
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600'
  }
}