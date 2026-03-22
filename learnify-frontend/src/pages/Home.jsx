import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getAllCourses } from "../redux/slices/courseSlice.js"
import Navbar from "../components/Navbar.jsx"

export default function Home() {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { courses, loading, total } = useSelector((state) => state.course)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("")
  const [sort, setSort] = useState("")

  useEffect(() => {
    dispatch(getAllCourses())
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(getAllCourses({ search, category, level, sort }))
  }

  const handleFilter = (key, value) => {

    const filters = { search, category, level, sort, [key]: value }

    if (key === "category") setCategory(value)
    if (key === "level") setLevel(value)
    if (key === "sort") setSort(value)

    dispatch(getAllCourses(filters))
  }

  const handleReset = () => {
    setSearch("")
    setCategory("")
    setLevel("")
    setSort("")
    dispatch(getAllCourses())
  }

  const getCategoryGradient = (category) => {
    const gradients = {
      "Web Dev": "linear-gradient(135deg,#6366f1,#8b5cf6)",
      "Mobile Dev": "linear-gradient(135deg,#06b6d4,#3b82f6)",
      "Data Science": "linear-gradient(135deg,#10b981,#059669)",
      "Design": "linear-gradient(135deg,#f59e0b,#ef4444)",
      "Marketing": "linear-gradient(135deg,#ec4899,#8b5cf6)",
      "Other": "linear-gradient(135deg,#6b7280,#9ca3af)"
    }

    return gradients[category] || gradients["Other"]
  }

  const getCategoryIcon = (category) => {
    const icons = {
      "Web Dev": "💻",
      "Mobile Dev": "📱",
      "Data Science": "📊",
      "Design": "🎨",
      "Marketing": "📢",
      "Other": "🎓"
    }

    return icons[category] || "🎓"
  }

  return (
    <div>

      <Navbar />

      {/* HERO */}
      <div style={styles.hero}>

        <h1 style={styles.heroTitle}>Learn Without Limits</h1>

        <p style={styles.heroSubtitle}>
          Explore thousands of courses taught by expert instructors
        </p>

        <form onSubmit={handleSearch} style={styles.searchForm}>

          <input
            type="text"
            placeholder="Search for courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <button type="submit" style={styles.searchBtn}>
            Search
          </button>

        </form>

      </div>

      {/* FILTERS */}
      <div style={styles.filterSection}>

        <div style={styles.filterContainer}>

          <select
            value={category}
            onChange={(e) => handleFilter("category", e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            <option value="Web Dev">Web Dev</option>
            <option value="Mobile Dev">Mobile Dev</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={level}
            onChange={(e) => handleFilter("level", e.target.value)}
            style={styles.select}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={sort}
            onChange={(e) => handleFilter("sort", e.target.value)}
            style={styles.select}
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {(category || level || sort || search) && (
            <button onClick={handleReset} style={styles.resetBtn}>
              Reset
            </button>
          )}

          <span style={styles.totalText}>
            {total} courses found
          </span>

        </div>

      </div>

      {/* COURSES GRID */}

      <div style={styles.main}>

        {loading ? (

          <div style={styles.loading}>
            Loading courses...
          </div>

        ) : courses.length === 0 ? (

          <div style={styles.empty}>
            <p>No courses found</p>
          </div>

        ) : (

          <div style={styles.grid}>

            {courses.map((course) => (

              <div
                key={course._id}
                style={styles.card}
                onClick={() => navigate(`/courses/${course._id}`)}
              >

                <div style={styles.thumbnail}>

                  {course.thumbnail ? (

                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={styles.thumbnailImg}
                    />

                  ) : (

                    <div
                      style={{
                        ...styles.thumbnailPlaceholder,
                        background: getCategoryGradient(course.category)
                      }}
                    >

                      <span style={styles.thumbnailIcon}>
                        {getCategoryIcon(course.category)}
                      </span>

                    </div>

                  )}

                </div>

                <div style={styles.cardBody}>

                  <div style={styles.cardTags}>
                    <span style={styles.categoryTag}>
                      {course.category}
                    </span>
                    <span style={styles.levelTag}>
                      {course.level}
                    </span>
                  </div>

                  <h3 style={styles.courseTitle}>
                    {course.title}
                  </h3>

                  <p style={styles.courseDesc}>
                    {course.description.length > 80
                      ? course.description.slice(0, 80) + "..."
                      : course.description}
                  </p>

                  <div style={styles.instructorRow}>
                    <span style={styles.instructorName}>
                      By {course.instructor?.name}
                    </span>
                  </div>

                  <div style={styles.cardFooter}>

                    <div style={styles.rating}>
                      ⭐ {course.rating > 0 ? course.rating : "New"}
                      <span style={styles.reviews}>
                        ({course.totalReviews} reviews)
                      </span>
                    </div>

                    <span style={styles.price}>
                      ₹{course.price}
                    </span>

                  </div>

                  <div style={styles.students}>
                    {course.enrolledStudents?.length} students enrolled
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}


const styles = {

  hero: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    padding: "80px 24px",
    textAlign: "center"
  },

  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    marginBottom: "16px"
  },

  heroSubtitle: {
    fontSize: "18px",
    opacity: 0.85,
    marginBottom: "32px"
  },

  searchForm: {
    display: "flex",
    maxWidth: "560px",
    margin: "0 auto",
    gap: "10px"
  },

  searchInput: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "10px",
    border: "none",
    fontSize: "15px"
  },

  searchBtn: {
    padding: "14px 28px",
    background: "#fbbf24",
    color: "#1a1a2e",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700"
  },

  filterSection: {
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: "16px 24px"
  },

  filterContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  select: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fff"
  },

  resetBtn: {
    padding: "8px 16px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px"
  },

  totalText: {
    marginLeft: "auto",
    fontSize: "14px",
    color: "#888"
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "24px"
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    cursor: "pointer"
  },

  thumbnail: {
    height: "180px"
  },

  thumbnailImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  thumbnailIcon: {
    fontSize: "48px"
  },

  cardBody: {
    padding: "16px"
  },

  cardTags: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px"
  },

  categoryTag: {
    fontSize: "11px",
    padding: "3px 8px",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "4px"
  },

  levelTag: {
    fontSize: "11px",
    padding: "3px 8px",
    background: "#f0fdf4",
    color: "#16a34a",
    borderRadius: "4px"
  },

  courseTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  courseDesc: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "12px"
  },

  instructorName: {
    fontSize: "12px",
    color: "#888"
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },

  price: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#4f46e5"
  },

  students: {
    fontSize: "12px",
    color: "#aaa"
  }

}