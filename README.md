Learnify — Online Learning Platform
A full stack online learning platform built with the MERN stack. Students can browse, enroll, and learn from courses while instructors can create and manage their content with real-time analytics dashboards.

✨ Features
Student

Browse and search 20+ courses with filters (category, level, price)
Enroll in courses with Razorpay payment gateway
Watch video lectures with progress tracking
Mark lectures as complete and track overall progress
Leave reviews and ratings after course completion
Student dashboard with charts and analytics

Instructor

Create, edit, and delete courses
Add video lectures to courses
Publish/unpublish courses
Instructor dashboard with revenue analytics
View enrolled students per course

Admin

View all users, courses, and enrollments
Admin analytics dashboard
Delete users and courses

General

JWT authentication with role-based access (student / instructor / admin)
Fully responsive UI
Toast notifications
Search, filter, and sort courses
Razorpay payment integration


🛠️ Tech Stack
Frontend
TechnologyPurposeReact.js (Vite)UI frameworkRedux ToolkitState managementReact Router DOMClient-side routingAxiosAPI requestsRechartsDashboard chartsReact ToastifyNotificationsRazorpay CheckoutPayment UI
Backend
TechnologyPurposeNode.jsRuntime environmentExpress.jsWeb frameworkMongoDBDatabaseMongooseODM for MongoDBJWT + bcryptjsAuthenticationMulter + CloudinaryFile uploadsRazorpayPayment gateway

📁 Project Structure
learnify-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── auth.controller.js
│   ├── course.controller.js
│   ├── lecture.controller.js
│   ├── enrollment.controller.js
│   ├── review.controller.js
│   ├── user.controller.js
│   └── payment.controller.js
├── middleware/
│   ├── verifyToken.js
│   ├── verifyRole.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Lecture.js
│   ├── Enrollment.js
│   └── Review.js
├── routes/
│   ├── auth.routes.js
│   ├── course.routes.js
│   ├── lecture.routes.js
│   ├── enrollment.routes.js
│   ├── review.routes.js
│   ├── user.routes.js
│   └── payment.routes.js
├── utils/
│   └── cloudinary.js
├── seed.js
├── seedLectures.js
└── index.js

learnify-frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── WatchCourse.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── InstructorDashboard.jsx
│   ├── redux/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── courseSlice.js
│   │       └── enrollmentSlice.js
│   ├── utils/
│   │   └── axios.js
│   ├── App.jsx
│   └── main.jsx

🗄️ Database Schema
User
name, email, password (hashed), role (student/instructor/admin),
avatar, bio, enrolledCourses[], createdCourses[]
Course
title, description, instructor (ref), thumbnail, price,
category, level, lectures[], enrolledStudents[],
totalDuration, isPublished, rating, totalReviews
Lecture
title, description, course (ref), videoUrl, publicId,
duration, order, isFree
Enrollment
student (ref), course (ref), completedLectures[],
progress (0-100), isCompleted, completedAt, paymentId
Review
student (ref), course (ref), rating (1-5), comment

🔌 API Endpoints
Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
Courses
GET    /api/courses                       (public)
GET    /api/courses/:id                   (public)
POST   /api/courses                       (instructor)
PUT    /api/courses/:id                   (instructor)
DELETE /api/courses/:id                   (instructor/admin)
PATCH  /api/courses/:id/publish           (instructor)
GET    /api/courses/instructor/my-courses (instructor)
Lectures
GET    /api/lectures/:courseId            (public)
GET    /api/lectures/single/:id           (public)
POST   /api/lectures/:courseId            (instructor)
PUT    /api/lectures/:id                  (instructor)
DELETE /api/lectures/:id                  (instructor/admin)
Enrollments
POST   /api/enroll/:courseId              (student)
GET    /api/enroll/my-courses             (student)
PUT    /api/enroll/progress               (student)
GET    /api/enroll/check/:courseId        (any user)
GET    /api/enroll/students/:courseId     (instructor)
Reviews
GET    /api/reviews/:courseId             (public)
POST   /api/reviews/:courseId             (student)
PUT    /api/reviews/:id                   (student)
DELETE /api/reviews/:id                   (student/admin)
Users
GET    /api/users/profile                 (any user)
PUT    /api/users/profile                 (any user)
GET    /api/users/dashboard/student       (student)
GET    /api/users/dashboard/instructor    (instructor)
GET    /api/users/dashboard/admin         (admin)
GET    /api/users/all                     (admin)
DELETE /api/users/:id                     (admin)
Payments
GET    /api/payment/key
POST   /api/payment/order/:courseId       (student)
POST   /api/payment/verify                (student)

⚙️ Setup & Installation
Prerequisites

Node.js v18+
MongoDB installed locally
Razorpay account (test mode)
Cloudinary account

Backend Setup
bash# Clone the repo
git clone https://github.com/YOUR_USERNAME/learnify-backend.git
cd learnify-backend

# Install dependencies
npm install

# Create .env file and fill in your values
MONGO_URI=mongodb://localhost:27017/learnify
PORT=8000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Seed the database
npm run seed
npm run seed:lectures

# Start development server
npm run dev
Frontend Setup
bash# Clone the repo
git clone https://github.com/YOUR_USERNAME/learnify-frontend.git
cd learnify-frontend

# Install dependencies
npm install

# Create .env file
VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev

💳 Test Payment Credentials
FieldValueCard Number4111 1111 1111 1111Expiry12/26CVV123NameAny name

👤 Test Accounts
RoleEmailPasswordStudentstudent@gmail.com123456Instructorjohn@gmail.com123456

👨‍💻 Author
Lohith Kumar

GitHub: @lohithkumark


📄 License
This project is licensed under the MIT License.
