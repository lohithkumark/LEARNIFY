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

export default function InstructorDashboard() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [courseAnalytics, setCourseAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Web Dev',
    level: 'Beginner'
  })

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate('/login')
      return
    }
    fetchDashboard()
  }, [user])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/users/dashboard/instructor')
      setStats(res.data.stats)
      setCourseAnalytics(res.data.courseAnalytics)
    } catch (err) {
      toast.error('Failed to load dashboard')
    }
    setLoading(false)
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await axios.post('/courses', newCourse)
      toast.success('Course created successfully!')
      setShowCreateModal(false)
      setNewCourse({
        title: '',
        description: '',
        price: '',
        category: 'Web Dev',
        level: 'Beginner'
      })
      fetchDashboard()
    } catch (err) {
      toast.error('Failed to create course')
    }
    setCreating(false)
  }

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await axios.patch(`/courses/${courseId}/publish`)
      toast.success(res.data.message)
      fetchDashboard()
    } catch (err) {
      toast.error('Failed to toggle publish')
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    try {
      await axios.delete(`/courses/${courseId}`)
      toast.success('Course deleted successfully')
      fetchDashboard()
    } catch (err) {
      toast.error('Failed to delete course')
    }
  }

  const COLORS = ['#4f46e5', '#7c3aed', '#059669', '#f59e0b', '#ef4444']

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
              Here's how your courses are performing
            </p>
          </div>
          <button
            style={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Course
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statValue}>{stats?.totalCourses}</div>
            <div style={styles.statLabel}>Total Courses</div>
            <div style={styles.statSub}>
              {stats?.publishedCourses} published
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>{stats?.totalStudents}</div>
            <div style={styles.statLabel}>Total Students</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>₹{stats?.totalRevenue}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statValue}>{stats?.avgRating || 'N/A'}</div>
            <div style={styles.statLabel}>Average Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'courses'].map((tab) => (
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
          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Students per Course</h3>
              {courseAnalytics.length === 0 ? (
                <p style={styles.empty}>No courses yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={courseAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(0, 12) + '...'}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Revenue per Course</h3>
              {courseAnalytics.length === 0 ? (
                <p style={styles.empty}>No courses yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={courseAnalytics}
                      dataKey="revenue"
                      nameKey="title"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {courseAnalytics.map((_, index) => (
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
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            {courseAnalytics.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  You haven't created any courses yet.
                </p>
                <button
                  style={styles.createBtn}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create your first course
                </button>
              </div>
            ) : (
              <div style={styles.courseTable}>
                <div style={styles.tableHeader}>
                  <span>Course</span>
                  <span>Students</span>
                  <span>Revenue</span>
                  <span>Rating</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {courseAnalytics.map((course) => (
                  <div key={course.id} style={styles.tableRow}>
                    <span style={styles.courseTitle}>{course.title}</span>
                    <span>{course.students}</span>
                    <span>₹{course.revenue}</span>
                    <span>⭐ {course.rating || 'N/A'}</span>
                    <span>
                      <span
                        style={course.isPublished
                          ? styles.publishedBadge
                          : styles.draftBadge}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </span>
                    <span style={styles.actions}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        View
                      </button>
                      <button
                        style={course.isPublished
                          ? styles.unpublishBtn
                          : styles.publishBtn}
                        onClick={() => handleTogglePublish(course.id)}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Course</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete React Course"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  placeholder="What will students learn?"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  style={styles.textarea}
                  rows={4}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, price: e.target.value })
                    }
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, category: e.target.value })
                    }
                    style={styles.input}
                  >
                    <option>Web Dev</option>
                    <option>Mobile Dev</option>
                    <option>Data Science</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, level: e.target.value })
                    }
                    style={styles.input}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={creating ? styles.btnDisabled : styles.submitBtn}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  loading: { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#888' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '32px'
  },
  headerTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  headerSub: { fontSize: '14px', color: '#888', marginTop: '4px' },
  createBtn: {
    padding: '12px 24px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600'
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
  statSub: { fontSize: '12px', color: '#4f46e5', marginTop: '4px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px' },
  tab: {
    padding: '10px 20px', background: '#fff', border: '1px solid #eee',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#888', cursor: 'pointer'
  },
  tabActive: {
    padding: '10px 20px', background: '#4f46e5', border: '1px solid #4f46e5',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer'
  },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  chartCard: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  chartTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px' },
  empty: { color: '#888', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
  emptyState: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px' },
  emptyText: { fontSize: '16px', color: '#888', marginBottom: '20px' },
  courseTable: {
    background: '#fff', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
    padding: '14px 20px', background: '#f9fafb',
    fontSize: '13px', fontWeight: '600', color: '#888',
    borderBottom: '1px solid #eee'
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
    padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
    fontSize: '14px', color: '#333', alignItems: 'center'
  },
  courseTitle: { fontWeight: '600', color: '#1a1a2e' },
  publishedBadge: {
    fontSize: '11px', fontWeight: '600', padding: '3px 10px',
    background: '#dcfce7', color: '#16a34a', borderRadius: '20px'
  },
  draftBadge: {
    fontSize: '11px', fontWeight: '600', padding: '3px 10px',
    background: '#fef9c3', color: '#ca8a04', borderRadius: '20px'
  },
  actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  actionBtn: {
    padding: '5px 10px', background: '#e0e7ff', color: '#4f46e5',
    border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  },
  publishBtn: {
    padding: '5px 10px', background: '#dcfce7', color: '#16a34a',
    border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  },
  unpublishBtn: {
    padding: '5px 10px', background: '#fef9c3', color: '#ca8a04',
    border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  },
  deleteBtn: {
    padding: '5px 10px', background: '#fee2e2', color: '#dc2626',
    border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px'
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '18px',
    color: '#888', cursor: 'pointer'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px'
  },
  textarea: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', resize: 'vertical'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '12px', marginTop: '8px'
  },
  cancelBtn: {
    padding: '10px 20px', background: '#f3f4f6', color: '#333',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 20px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  btnDisabled: {
    padding: '10px 20px', background: '#a5b4fc', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
}