import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCourseById } from '../redux/slices/courseSlice.js'
import { enrollInCourse } from '../redux/slices/enrollmentSlice.js'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar.jsx'
import axios from '../utils/axios.js'

export default function CourseDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentCourse, loading } = useSelector((state) => state.course)
  const { user } = useSelector((state) => state.auth)

  const [lectures, setLectures] = useState([])
  const [reviews, setReviews] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    dispatch(getCourseById(id))
    fetchLectures()
    fetchReviews()
    if (user) checkEnrollment()
  }, [id, user])

  const fetchLectures = async () => {
    try {
      const res = await axios.get(`/lectures/${id}`)
      setLectures(res.data.lectures)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/reviews/${id}`)
      setReviews(res.data.reviews)
    } catch (err) {
      console.log(err)
    }
  }

  const checkEnrollment = async () => {
    try {
      const res = await axios.get(`/enroll/check/${id}`)
      setIsEnrolled(res.data.isEnrolled)
    } catch (err) {
      console.log(err)
    }
  }

 const handleEnroll = async () => {
  if (!user) {
    toast.error('Please login to enroll')
    navigate('/login')
    return
  }
  if (user.role !== 'student') {
    toast.error('Only students can enroll in courses')
    return
  }

  setEnrolling(true)

  try {
    // free course — enroll directly
    if (currentCourse.price === 0) {
      await dispatch(enrollInCourse(id)).unwrap()
      setIsEnrolled(true)
      toast.success('Enrolled successfully!')
      setEnrolling(false)
      return
    }

    // paid course — create razorpay order
    const res = await axios.post(`/payment/order/${id}`)
    const { order, key, course } = res.data

    const options = {
      key,
      amount: order.amount,
      currency: 'INR',
      name: 'Learnify',
      description: course.title,
      order_id: order.id,
      handler: async (response) => {
        try {
          // verify payment
          const verifyRes = await axios.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId: id
          })

          if (verifyRes.data.success) {
            setIsEnrolled(true)
            toast.success('Payment successful! Enrolled in course.')
          }
        } catch (err) {
          toast.error('Payment verification failed')
        }
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: {
        color: '#4f46e5'
      }
    }

    const razor = new window.Razorpay(options)
    razor.open()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Something went wrong')
  }

  setEnrolling(false)
}

  if (loading || !currentCourse) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading course...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.tags}>
              <span style={styles.categoryTag}>{currentCourse.category}</span>
              <span style={styles.levelTag}>{currentCourse.level}</span>
            </div>
            <h1 style={styles.title}>{currentCourse.title}</h1>
            <p style={styles.desc}>{currentCourse.description}</p>

            <div style={styles.meta}>
              <span>⭐ {currentCourse.rating || 'New'}</span>
              <span>({currentCourse.totalReviews} reviews)</span>
              <span>👥 {currentCourse.enrolledStudents?.length} students</span>
              <span>📚 {lectures.length} lectures</span>
            </div>

            <div style={styles.instructor}>
              By <strong>{currentCourse.instructor?.name}</strong>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.enrollCard}>
              {currentCourse.thumbnail ? (
                <img
                  src={currentCourse.thumbnail}
                  alt={currentCourse.title}
                  style={styles.thumbnail}
                />
              ) : (
                <div style={styles.thumbnailPlaceholder}>🎓</div>
              )}

              <div style={styles.enrollCardBody}>
                <div style={styles.price}>₹{currentCourse.price}</div>

                {isEnrolled ? (
                  <button
                    style={styles.watchBtn}
                    onClick={() => navigate(`/watch/${id}`)}
                  >
                    Continue Learning
                  </button>
                ) : (
                  <button
                    style={enrolling ? styles.btnDisabled : styles.enrollBtn}
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                <ul style={styles.includes}>
                  <li>✅ {lectures.length} lectures</li>
                  <li>✅ Full lifetime access</li>
                  <li>✅ Certificate of completion</li>
                  <li>✅ Access on mobile and desktop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsBar}>
        <div style={styles.tabsContainer}>
          {['overview', 'lectures', 'reviews'].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About this course</h2>
            <p style={styles.sectionText}>{currentCourse.description}</p>

            <h2 style={styles.sectionTitle}>Instructor</h2>
            <div style={styles.instructorCard}>
              <div style={styles.instructorAvatar}>
                {currentCourse.instructor?.avatar ? (
                  <img
                    src={currentCourse.instructor.avatar}
                    alt={currentCourse.instructor.name}
                    style={styles.avatarImg}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {currentCourse.instructor?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div style={styles.instructorName}>
                  {currentCourse.instructor?.name}
                </div>
                <div style={styles.instructorBio}>
                  {currentCourse.instructor?.bio || 'Expert instructor'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lectures Tab */}
        {activeTab === 'lectures' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Course Content — {lectures.length} lectures
            </h2>
            {lectures.length === 0 ? (
              <p style={styles.empty}>No lectures added yet.</p>
            ) : (
              <div style={styles.lectureList}>
                {lectures.map((lecture, index) => (
                  <div key={lecture._id} style={styles.lectureItem}>
                    <div style={styles.lectureLeft}>
                      <span style={styles.lectureNum}>{index + 1}</span>
                      <div>
                        <div style={styles.lectureTitle}>{lecture.title}</div>
                        {lecture.description && (
                          <div style={styles.lectureDesc}>
                            {lecture.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.lectureRight}>
                      {lecture.isFree ? (
                        <span style={styles.freeBadge}>Free Preview</span>
                      ) : isEnrolled ? (
                        <span style={styles.lockedBadge}>Watch</span>
                      ) : (
                        <span style={styles.lockedBadge}>🔒 Locked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Student Reviews — {reviews.length} reviews
            </h2>
            {reviews.length === 0 ? (
              <p style={styles.empty}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={styles.reviewList}>
                {reviews.map((review) => (
                  <div key={review._id} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewAvatar}>
                        {review.student?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={styles.reviewName}>
                          {review.student?.name}
                        </div>
                        <div style={styles.reviewRating}>
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
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
  loading: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '16px',
    color: '#888'
  },
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#fff',
    padding: '60px 24px'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '40px',
    alignItems: 'start'
  },
  heroLeft: {},
  tags: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  categoryTag: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    background: '#4f46e5',
    borderRadius: '4px'
  },
  levelTag: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    background: '#059669',
    borderRadius: '4px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '16px',
    lineHeight: '1.3'
  },
  desc: {
    fontSize: '16px',
    opacity: 0.85,
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  meta: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    opacity: 0.8,
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  instructor: {
    fontSize: '14px',
    opacity: 0.75
  },
  heroRight: {},
  enrollCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  },
  thumbnail: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px'
  },
  enrollCardBody: {
    padding: '24px'
  },
  price: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '16px'
  },
  enrollBtn: {
    width: '100%',
    padding: '14px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  watchBtn: {
    width: '100%',
    padding: '14px',
    background: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  btnDisabled: {
    width: '100%',
    padding: '14px',
    background: '#a5b4fc',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  includes: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tabsBar: {
    background: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: '64px',
    zIndex: 99
  },
  tabsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    gap: '4px'
  },
  tab: {
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#888',
    cursor: 'pointer'
  },
  tabActive: {
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid #4f46e5',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
    cursor: 'pointer'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px'
  },
  section: {
    maxWidth: '800px'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '16px',
    marginTop: '32px'
  },
  sectionText: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.7'
  },
  instructorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '10px'
  },
  instructorAvatar: {},
  avatarImg: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700'
  },
  instructorName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  instructorBio: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  lectureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  lectureItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '4px'
  },
  lectureLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  lectureNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0
  },
  lectureTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e'
  },
  lectureDesc: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px'
  },
  lectureRight: {},
  freeBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '20px'
  },
  lockedBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    background: '#f3f4f6',
    color: '#6b7280',
    borderRadius: '20px'
  },
  empty: {
    fontSize: '15px',
    color: '#888',
    padding: '20px 0'
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  reviewItem: {
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '10px'
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0
  },
  reviewName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  reviewRating: {
    fontSize: '12px',
    marginTop: '2px'
  },
  reviewComment: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6'
  }
}