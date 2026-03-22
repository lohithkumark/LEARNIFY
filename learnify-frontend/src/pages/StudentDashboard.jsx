import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar.jsx'
import axios from '../utils/axios.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login')
      return
    }
    fetchDashboard()
  }, [user])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/users/dashboard/student')
      setStats(res.data.stats)
      setEnrollments(res.data.enrollments)
      setRecentEnrollments(res.data.recentEnrollments)
    } catch (err) {
      toast.error('Failed to load dashboard')
    }
    setLoading(false)
  }

  const COLORS = ['#4f46e5', '#059669', '#f59e0b', '#ef4444']

  const pieData = stats ? [
    { name: 'Completed', value: stats.completedCourses },
    { name: 'In Progress', value: stats.inProgressCourses },
    { name: 'Not Started', value: stats.notStartedCourses },
  ] : []

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              Welcome back, {user?.name}!
            </h1>
            <p style={styles.headerSub}>
              Keep learning and track your progress
            </p>
          </div>
          <button
            style={styles.browseBtn}
            onClick={() => navigate('/')}
          >
            Browse Courses
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statValue}>{stats?.totalEnrolled}</div>
            <div style={styles.statLabel}>Enrolled Courses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statValue}>{stats?.completedCourses}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statValue}>{stats?.inProgressCourses}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statValue}>{stats?.avgProgress}%</div>
            <div style={styles.statLabel}>Average Progress</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'my courses'].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.chartsGrid}>

              {/* Progress Chart */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Course Status</h3>
                {pieData.every(d => d.value === 0) ? (
                  <p style={styles.empty}>
                    No courses enrolled yet.{' '}
                    <span
                      style={styles.browseLink}
                      onClick={() => navigate('/')}
                    >
                      Browse courses
                    </span>
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Progress per course */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Progress per Course</h3>
                {enrollments.length === 0 ? (
                  <p style={styles.empty}>No courses yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={enrollments.map(e => ({
                        name: e.course?.title?.slice(0, 12) + '...',
                        progress: e.progress
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="progress"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Enrollments */}
            <div style={styles.recentCard}>
              <h3 style={styles.chartTitle}>Recently Enrolled</h3>
              {recentEnrollments.length === 0 ? (
                <p style={styles.empty}>No recent enrollments</p>
              ) : (
                <div style={styles.recentList}>
                  {recentEnrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      style={styles.recentItem}
                      onClick={() =>
                        navigate(`/courses/${enrollment.course?._id}`)
                      }
                    >
                      <div style={styles.recentThumb}>
                        {enrollment.course?.thumbnail ? (
                          <img
                            src={enrollment.course.thumbnail}
                            alt=""
                            style={styles.recentThumbImg}
                          />
                        ) : (
                          <div style={styles.recentThumbPlaceholder}>🎓</div>
                        )}
                      </div>
                      <div style={styles.recentInfo}>
                        <div style={styles.recentTitle}>
                          {enrollment.course?.title}
                        </div>
                        <div style={styles.recentProgress}>
                          <div style={styles.progressBar}>
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${enrollment.progress}%`
                              }}
                            />
                          </div>
                          <span style={styles.progressText}>
                            {enrollment.progress}%
                          </span>
                        </div>
                      </div>
                      {enrollment.isCompleted && (
                        <span style={styles.completedBadge}>Completed ✅</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my courses' && (
          <div>
            {enrollments.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  You haven't enrolled in any courses yet.
                </p>
                <button
                  style={styles.browseBtn}
                  onClick={() => navigate('/')}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div style={styles.coursesGrid}>
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    style={styles.courseCard}
                    onClick={() =>
                      navigate(`/courses/${enrollment.course?._id}`)
                    }
                  >
                    <div style={styles.courseThumb}>
                      {enrollment.course?.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt=""
                          style={styles.courseThumbImg}
                        />
                      ) : (
                        <div style={styles.courseThumbPlaceholder}>🎓</div>
                      )}
                    </div>
                    <div style={styles.courseBody}>
                      <h4 style={styles.courseName}>
                        {enrollment.course?.title}
                      </h4>
                      <div style={styles.progressRow}>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${enrollment.progress}%`
                            }}
                          />
                        </div>
                        <span style={styles.progressText}>
                          {enrollment.progress}%
                        </span>
                      </div>
                      <div style={styles.courseFooter}>
                        {enrollment.isCompleted ? (
                          <span style={styles.completedBadge}>
                            Completed ✅
                          </span>
                        ) : (
                          <span style={styles.inProgressBadge}>
                            In Progress
                          </span>
                        )}
                        <button
                          style={styles.continueBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/watch/${enrollment.course?._id}`)
                          }}
                        >
                          {enrollment.progress === 0
                            ? 'Start'
                            : 'Continue'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  loading: {
    textAlign: 'center', padding: '80px',
    fontSize: '16px', color: '#888'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '32px'
  },
  headerTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  headerSub: { fontSize: '14px', color: '#888', marginTop: '4px' },
  browseBtn: {
    padding: '12px 24px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px', marginBottom: '32px'
  },
  statCard: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center'
  },
  statIcon: { fontSize: '32px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: '14px', color: '#888', marginTop: '4px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px' },
  tab: {
    padding: '10px 20px', background: '#fff', border: '1px solid #eee',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500',
    color: '#888', cursor: 'pointer'
  },
  tabActive: {
    padding: '10px 20px', background: '#4f46e5', border: '1px solid #4f46e5',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    color: '#fff', cursor: 'pointer'
  },
  chartsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '24px', marginBottom: '24px'
  },
  chartCard: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  chartTitle: {
    fontSize: '16px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '20px'
  },
  empty: { color: '#888', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
  browseLink: { color: '#4f46e5', fontWeight: '600', cursor: 'pointer' },
  recentCard: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  recentList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  recentItem: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '12px', borderRadius: '10px', background: '#f9fafb',
    cursor: 'pointer'
  },
  recentThumb: {
    width: '56px', height: '56px',
    borderRadius: '8px', overflow: 'hidden', flexShrink: 0
  },
  recentThumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  recentThumbPlaceholder: {
    width: '100%', height: '100%', background: '#e0e7ff',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px'
  },
  recentInfo: { flex: 1 },
  recentTitle: {
    fontSize: '14px', fontWeight: '600',
    color: '#1a1a2e', marginBottom: '8px'
  },
  recentProgress: {
    display: 'flex', alignItems: 'center', gap: '10px'
  },
  progressBar: {
    flex: 1, height: '6px', background: '#e5e7eb',
    borderRadius: '3px', overflow: 'hidden'
  },
  progressFill: {
    height: '100%', background: '#4f46e5',
    borderRadius: '3px', transition: 'width 0.3s'
  },
  progressText: { fontSize: '12px', color: '#888', minWidth: '32px' },
  completedBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 10px',
    background: '#dcfce7', color: '#16a34a', borderRadius: '20px'
  },
  emptyState: {
    textAlign: 'center', padding: '60px', background: '#fff',
    borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  emptyText: { fontSize: '16px', color: '#888', marginBottom: '20px' },
  coursesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  courseCard: {
    background: '#fff', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer'
  },
  courseThumb: { height: '160px', overflow: 'hidden' },
  courseThumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  courseThumbPlaceholder: {
    width: '100%', height: '100%', background: '#e0e7ff',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '48px'
  },
  courseBody: { padding: '16px' },
  courseName: {
    fontSize: '15px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '12px'
  },
  progressRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '12px'
  },
  courseFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  inProgressBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 10px',
    background: '#fef9c3', color: '#ca8a04', borderRadius: '20px'
  },
  continueBtn: {
    padding: '7px 16px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer'
  }
}