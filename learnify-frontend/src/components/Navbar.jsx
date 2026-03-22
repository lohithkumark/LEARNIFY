import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice.js'
import { toast } from 'react-toastify'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'student') return '/student/dashboard'
    if (user.role === 'instructor') return '/instructor/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Learnify
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>Courses</Link>

          {user ? (
            <>
              <Link to={getDashboardLink()} style={styles.link}>
                Dashboard
              </Link>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: '-0.5px'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  link: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    transition: 'color 0.2s'
  },
  registerBtn: {
    padding: '8px 18px',
    background: '#4f46e5',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  userRole: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'capitalize'
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600'
  }
}