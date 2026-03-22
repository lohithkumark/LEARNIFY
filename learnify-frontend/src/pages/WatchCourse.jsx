import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar.jsx'
import axios from '../utils/axios.js'

export default function WatchCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [currentLecture, setCurrentLecture] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchData()
  }, [id, user])

  const fetchData = async () => {
    try {
      const [courseRes, lecturesRes, enrollmentRes] = await Promise.all([
        axios.get(`/courses/${id}`),
        axios.get(`/lectures/${id}`),
        axios.get(`/enroll/${id}`)
      ])
      setCourse(courseRes.data.course)
      setLectures(lecturesRes.data.lectures)
      setEnrollment(enrollmentRes.data.enrollment)
      if (lecturesRes.data.lectures.length > 0) {
        setCurrentLecture(lecturesRes.data.lectures[0])
      }
    } catch (err) {
      toast.error('Failed to load course')
      navigate('/')
    }
    setLoading(false)
  }

  const handleMarkComplete = async () => {
    if (!currentLecture) return

    const alreadyDone = enrollment?.completedLectures?.some(
      (l) => l._id === currentLecture._id || l === currentLecture._id
    )

    if (alreadyDone) {
      toast.info('Already marked as complete')
      return
    }

    try {
      const res = await axios.put('/enroll/progress', {
        courseId: id,
        lectureId: currentLecture._id
      })
      toast.success(`Progress: ${res.data.progress}%`)

      if (res.data.isCompleted) {
        toast.success('Congratulations! You completed the course! 🎉')
        setShowReviewForm(true)
      }

      // refresh enrollment
      const enrollmentRes = await axios.get(`/enroll/${id}`)
      setEnrollment(enrollmentRes.data.enrollment)

      // go to next lecture
      const currentIndex = lectures.findIndex(
        (l) => l._id === currentLecture._id
      )
      if (currentIndex < lectures.length - 1) {
        setCurrentLecture(lectures[currentIndex + 1])
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      await axios.post(`/reviews/${id}`, review)
      toast.success('Review submitted successfully!')
      setShowReviewForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
    setSubmittingReview(false)
  }

  const isLectureCompleted = (lectureId) => {
    return enrollment?.completedLectures?.some(
      (l) => l._id === lectureId || l === lectureId
    )
  }

  const getProgress = () => {
    return enrollment?.progress || 0
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading course...</div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.layout}>

        {/* Sidebar — Lecture List */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>{course?.title}</h3>
            <div style={styles.progressSection}>
              <div style={styles.progressTop}>
                <span style={styles.progressLabel}>Your progress</span>
                <span style={styles.progressValue}>{getProgress()}%</span>
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${getProgress()}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.lectureList}>
            {lectures.map((lecture, index) => (
              <div
                key={lecture._id}
                style={{
                  ...styles.lectureItem,
                  ...(currentLecture?._id === lecture._id
                    ? styles.lectureActive
                    : {})
                }}
                onClick={() => setCurrentLecture(lecture)}
              >
                <div style={styles.lectureLeft}>
                  <div style={styles.lectureNum}>
                    {isLectureCompleted(lecture._id) ? (
                      <span style={styles.checkIcon}>✓</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div style={styles.lectureName}>{lecture.title}</div>
                    {lecture.isFree && (
                      <span style={styles.freeBadge}>Free</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {currentLecture ? (
            <>
              {/* Video Player */}
              <div style={styles.videoSection}>
                {currentLecture.videoUrl ? (
                  <video
                    key={currentLecture._id}
                    controls
                    style={styles.video}
                    src={currentLecture.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div style={styles.noVideo}>
                    <span style={styles.noVideoIcon}>🎬</span>
                    <p style={styles.noVideoText}>
                      No video uploaded for this lecture yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Lecture Info */}
              <div style={styles.lectureInfo}>
                <div style={styles.lectureInfoHeader}>
                  <div>
                    <h2 style={styles.lectureTitle}>
                      {currentLecture.title}
                    </h2>
                    {currentLecture.description && (
                      <p style={styles.lectureDesc}>
                        {currentLecture.description}
                      </p>
                    )}
                  </div>

                  <div style={styles.lectureActions}>
                    {isLectureCompleted(currentLecture._id) ? (
                      <span style={styles.completedBadge}>
                        ✅ Completed
                      </span>
                    ) : (
                      <button
                        style={styles.markBtn}
                        onClick={handleMarkComplete}
                      >
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={styles.navBtns}>
                  <button
                    style={styles.navBtn}
                    onClick={() => {
                      const idx = lectures.findIndex(
                        (l) => l._id === currentLecture._id
                      )
                      if (idx > 0) setCurrentLecture(lectures[idx - 1])
                    }}
                    disabled={
                      lectures.findIndex(
                        (l) => l._id === currentLecture._id
                      ) === 0
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    style={styles.navBtn}
                    onClick={() => {
                      const idx = lectures.findIndex(
                        (l) => l._id === currentLecture._id
                      )
                      if (idx < lectures.length - 1) {
                        setCurrentLecture(lectures[idx + 1])
                      }
                    }}
                    disabled={
                      lectures.findIndex(
                        (l) => l._id === currentLecture._id
                      ) === lectures.length - 1
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.noLecture}>
              <p>No lectures available yet.</p>
            </div>
          )}

          {/* Review Form — shows after completion */}
          {showReviewForm && (
            <div style={styles.reviewSection}>
              <h3 style={styles.reviewTitle}>
                🎉 You completed the course! Leave a review
              </h3>
              <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                <div style={styles.ratingRow}>
                  <label style={styles.reviewLabel}>Rating</label>
                  <div style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          ...styles.star,
                          color: star <= review.rating ? '#f59e0b' : '#ddd'
                        }}
                        onClick={() =>
                          setReview({ ...review, rating: star })
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.reviewLabel}>Your Review</label>
                  <textarea
                    placeholder="Share your experience with this course..."
                    value={review.comment}
                    onChange={(e) =>
                      setReview({ ...review, comment: e.target.value })
                    }
                    style={styles.textarea}
                    rows={4}
                    required
                  />
                </div>
                <div style={styles.reviewBtns}>
                  <button
                    type="button"
                    style={styles.skipBtn}
                    onClick={() => setShowReviewForm(false)}
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    style={submittingReview
                      ? styles.btnDisabled
                      : styles.submitBtn}
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { background: '#f0f2f5', minHeight: '100vh' },
  loading: {
    textAlign: 'center', padding: '80px',
    fontSize: '16px', color: '#888'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    minHeight: 'calc(100vh - 64px)'
  },
  sidebar: {
    background: '#fff',
    borderRight: '1px solid #eee',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 64px)',
    position: 'sticky',
    top: '64px'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  sidebarTitle: {
    fontSize: '15px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '16px', lineHeight: '1.4'
  },
  progressSection: { marginTop: '8px' },
  progressTop: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: '6px'
  },
  progressLabel: { fontSize: '13px', color: '#888' },
  progressValue: { fontSize: '13px', fontWeight: '700', color: '#4f46e5' },
  progressBar: {
    height: '6px', background: '#e5e7eb',
    borderRadius: '3px', overflow: 'hidden'
  },
  progressFill: {
    height: '100%', background: '#4f46e5',
    borderRadius: '3px', transition: 'width 0.3s'
  },
  lectureList: { padding: '8px 0' },
  lectureItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px', cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'all 0.2s'
  },
  lectureActive: {
    background: '#eef2ff',
    borderLeft: '3px solid #4f46e5'
  },
  lectureLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  lectureNum: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: '#e0e7ff', color: '#4f46e5',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px',
    fontWeight: '700', flexShrink: 0
  },
  checkIcon: { color: '#059669', fontWeight: '800' },
  lectureName: {
    fontSize: '13px', fontWeight: '500',
    color: '#1a1a2e', lineHeight: '1.4'
  },
  freeBadge: {
    fontSize: '10px', fontWeight: '600', padding: '2px 6px',
    background: '#dcfce7', color: '#16a34a',
    borderRadius: '20px', marginTop: '2px', display: 'inline-block'
  },
  main: { padding: '24px', overflowY: 'auto' },
  videoSection: {
    background: '#000', borderRadius: '12px',
    overflow: 'hidden', marginBottom: '24px',
    aspectRatio: '16/9'
  },
  video: { width: '100%', height: '100%' },
  noVideo: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#1a1a2e', minHeight: '360px'
  },
  noVideoIcon: { fontSize: '64px', marginBottom: '16px' },
  noVideoText: { color: '#888', fontSize: '15px' },
  lectureInfo: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  lectureInfoHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '20px', gap: '16px'
  },
  lectureTitle: {
    fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px'
  },
  lectureDesc: { fontSize: '14px', color: '#666', lineHeight: '1.6' },
  lectureActions: { flexShrink: 0 },
  markBtn: {
    padding: '10px 20px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
  },
  completedBadge: {
    fontSize: '14px', fontWeight: '600', padding: '8px 16px',
    background: '#dcfce7', color: '#16a34a', borderRadius: '8px'
  },
  navBtns: { display: 'flex', gap: '12px' },
  navBtn: {
    padding: '10px 20px', background: '#f3f4f6', color: '#333',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  noLecture: {
    textAlign: 'center', padding: '80px',
    fontSize: '16px', color: '#888'
  },
  reviewSection: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '2px solid #4f46e5'
  },
  reviewTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1a1a2e', marginBottom: '20px'
  },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  reviewLabel: { fontSize: '14px', fontWeight: '600', color: '#444' },
  stars: { display: 'flex', gap: '4px' },
  star: { fontSize: '32px', cursor: 'pointer' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  textarea: {
    padding: '12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px', resize: 'vertical'
  },
  reviewBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  skipBtn: {
    padding: '10px 20px', background: '#f3f4f6', color: '#333',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 20px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  btnDisabled: {
    padding: '10px 20px', background: '#a5b4fc', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  }
}