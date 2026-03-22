import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from './models/Course.js'
import Lecture from './models/Lecture.js'

dotenv.config()

// sample youtube videos (free to use)
const sampleVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
]

const lecturesData = {
  'Complete React.js Developer Course': [
    { title: 'Introduction to React', description: 'What is React and why use it', order: 1, isFree: true },
    { title: 'Setting up the Environment', description: 'Install Node.js, VS Code and create React app', order: 2, isFree: true },
    { title: 'JSX and Components', description: 'Understanding JSX syntax and creating components', order: 3, isFree: false },
    { title: 'Props and State', description: 'Passing data with props and managing state', order: 4, isFree: false },
    { title: 'React Hooks — useState', description: 'Managing state with useState hook', order: 5, isFree: false },
    { title: 'React Hooks — useEffect', description: 'Side effects and lifecycle with useEffect', order: 6, isFree: false },
    { title: 'React Router', description: 'Client side routing with React Router DOM', order: 7, isFree: false },
    { title: 'Redux Toolkit', description: 'Global state management with Redux Toolkit', order: 8, isFree: false },
  ],
  'Node.js & Express Backend Mastery': [
    { title: 'Introduction to Node.js', description: 'What is Node.js and how it works', order: 1, isFree: true },
    { title: 'Setting up Express Server', description: 'Create your first Express server', order: 2, isFree: true },
    { title: 'REST API Fundamentals', description: 'GET, POST, PUT, DELETE requests', order: 3, isFree: false },
    { title: 'Middleware in Express', description: 'Understanding and creating middleware', order: 4, isFree: false },
    { title: 'JWT Authentication', description: 'Secure your API with JSON Web Tokens', order: 5, isFree: false },
    { title: 'File Uploads with Multer', description: 'Handle file uploads in Express', order: 6, isFree: false },
    { title: 'Error Handling', description: 'Global error handling in Express', order: 7, isFree: false },
  ],
  'MongoDB & Mongoose Complete Guide': [
    { title: 'Introduction to MongoDB', description: 'NoSQL databases and MongoDB basics', order: 1, isFree: true },
    { title: 'MongoDB Atlas Setup', description: 'Create a free cloud database', order: 2, isFree: true },
    { title: 'Mongoose Schemas', description: 'Define data models with Mongoose', order: 3, isFree: false },
    { title: 'CRUD Operations', description: 'Create, Read, Update, Delete with Mongoose', order: 4, isFree: false },
    { title: 'Relationships & Populate', description: 'Reference documents and populate', order: 5, isFree: false },
    { title: 'Aggregation Pipeline', description: 'Advanced data processing with aggregation', order: 6, isFree: false },
  ],
  'Full Stack MERN Development': [
    { title: 'MERN Stack Overview', description: 'Understanding the full stack architecture', order: 1, isFree: true },
    { title: 'Backend Setup', description: 'Setting up Node.js and Express', order: 2, isFree: true },
    { title: 'Database Design', description: 'Designing MongoDB schemas', order: 3, isFree: false },
    { title: 'Building REST APIs', description: 'Create complete REST API', order: 4, isFree: false },
    { title: 'React Frontend Setup', description: 'Setting up React with Vite', order: 5, isFree: false },
    { title: 'Connecting Frontend to Backend', description: 'Axios and API integration', order: 6, isFree: false },
    { title: 'Authentication Flow', description: 'JWT auth from frontend to backend', order: 7, isFree: false },
    { title: 'Deployment', description: 'Deploy to Vercel and Render', order: 8, isFree: false },
  ],
  'JavaScript — The Complete Guide 2024': [
    { title: 'JavaScript Basics', description: 'Variables, data types, and operators', order: 1, isFree: true },
    { title: 'Functions and Scope', description: 'Function declarations, expressions, and scope', order: 2, isFree: true },
    { title: 'Arrays and Objects', description: 'Working with arrays and objects', order: 3, isFree: false },
    { title: 'ES6+ Features', description: 'Arrow functions, destructuring, spread operator', order: 4, isFree: false },
    { title: 'Promises and Async/Await', description: 'Asynchronous JavaScript', order: 5, isFree: false },
    { title: 'DOM Manipulation', description: 'Interact with HTML using JavaScript', order: 6, isFree: false },
    { title: 'Closures and Prototypes', description: 'Advanced JavaScript concepts', order: 7, isFree: false },
  ],
  'Python for Data Science & ML': [
    { title: 'Python Basics', description: 'Variables, loops, and functions in Python', order: 1, isFree: true },
    { title: 'NumPy Fundamentals', description: 'Arrays and mathematical operations', order: 2, isFree: true },
    { title: 'Pandas for Data Analysis', description: 'DataFrames and data manipulation', order: 3, isFree: false },
    { title: 'Data Visualization', description: 'Charts and graphs with Matplotlib', order: 4, isFree: false },
    { title: 'Introduction to ML', description: 'Machine learning concepts and algorithms', order: 5, isFree: false },
    { title: 'Scikit-learn Basics', description: 'Build ML models with Scikit-learn', order: 6, isFree: false },
  ],
  'Machine Learning A-Z': [
    { title: 'ML Fundamentals', description: 'Types of machine learning', order: 1, isFree: true },
    { title: 'Linear Regression', description: 'Predict continuous values', order: 2, isFree: true },
    { title: 'Logistic Regression', description: 'Binary classification problems', order: 3, isFree: false },
    { title: 'Decision Trees', description: 'Tree-based learning algorithms', order: 4, isFree: false },
    { title: 'Random Forests', description: 'Ensemble learning methods', order: 5, isFree: false },
    { title: 'K-Means Clustering', description: 'Unsupervised learning', order: 6, isFree: false },
    { title: 'Model Evaluation', description: 'Accuracy, precision, recall, F1 score', order: 7, isFree: false },
  ],
  'Deep Learning with TensorFlow': [
    { title: 'Introduction to Deep Learning', description: 'Neural networks fundamentals', order: 1, isFree: true },
    { title: 'TensorFlow Setup', description: 'Install and configure TensorFlow', order: 2, isFree: true },
    { title: 'Building Neural Networks', description: 'Layers, activation functions, backprop', order: 3, isFree: false },
    { title: 'Convolutional Neural Networks', description: 'CNNs for image recognition', order: 4, isFree: false },
    { title: 'Recurrent Neural Networks', description: 'RNNs for sequential data', order: 5, isFree: false },
    { title: 'Transfer Learning', description: 'Use pretrained models', order: 6, isFree: false },
    { title: 'Model Deployment', description: 'Deploy TensorFlow models', order: 7, isFree: false },
  ],
  'React Native — Build Mobile Apps': [
    { title: 'React Native Introduction', description: 'Cross platform mobile development', order: 1, isFree: true },
    { title: 'Setting up Expo', description: 'Create your first React Native app', order: 2, isFree: true },
    { title: 'Core Components', description: 'View, Text, Image, ScrollView', order: 3, isFree: false },
    { title: 'Navigation', description: 'Stack and tab navigation', order: 4, isFree: false },
    { title: 'State Management', description: 'Redux in React Native', order: 5, isFree: false },
    { title: 'Device APIs', description: 'Camera, location, notifications', order: 6, isFree: false },
    { title: 'App Store Deployment', description: 'Publish to iOS and Android', order: 7, isFree: false },
  ],
  'Flutter & Dart Complete Course': [
    { title: 'Dart Basics', description: 'Variables, functions, classes in Dart', order: 1, isFree: true },
    { title: 'Flutter Introduction', description: 'Widgets and the Flutter framework', order: 2, isFree: true },
    { title: 'Layout Widgets', description: 'Row, Column, Stack, Container', order: 3, isFree: false },
    { title: 'State Management', description: 'setState and Provider', order: 4, isFree: false },
    { title: 'Firebase Integration', description: 'Auth and Firestore with Flutter', order: 5, isFree: false },
    { title: 'Animations', description: 'Beautiful animations in Flutter', order: 6, isFree: false },
  ],
  'iOS Development with Swift': [
    { title: 'Swift Basics', description: 'Variables, optionals, and control flow', order: 1, isFree: true },
    { title: 'Xcode Introduction', description: 'Setting up and using Xcode', order: 2, isFree: true },
    { title: 'UIKit Fundamentals', description: 'Views, view controllers, storyboards', order: 3, isFree: false },
    { title: 'Auto Layout', description: 'Responsive UI with constraints', order: 4, isFree: false },
    { title: 'Networking', description: 'API calls with URLSession', order: 5, isFree: false },
    { title: 'App Store Submission', description: 'Publish your app to App Store', order: 6, isFree: false },
  ],
  'UI/UX Design Masterclass': [
    { title: 'Design Principles', description: 'Color, typography, spacing', order: 1, isFree: true },
    { title: 'User Research', description: 'Understanding your users', order: 2, isFree: true },
    { title: 'Wireframing', description: 'Create low-fidelity wireframes', order: 3, isFree: false },
    { title: 'Figma Basics', description: 'Introduction to Figma', order: 4, isFree: false },
    { title: 'Prototyping', description: 'Interactive prototypes in Figma', order: 5, isFree: false },
    { title: 'Design Systems', description: 'Components and design tokens', order: 6, isFree: false },
    { title: 'Usability Testing', description: 'Test your designs with users', order: 7, isFree: false },
  ],
  'Adobe Photoshop Complete Course': [
    { title: 'Photoshop Interface', description: 'Tools, panels, and workspace', order: 1, isFree: true },
    { title: 'Layers and Masks', description: 'Non-destructive editing', order: 2, isFree: true },
    { title: 'Selection Tools', description: 'Precise selections and cutouts', order: 3, isFree: false },
    { title: 'Photo Retouching', description: 'Remove blemishes and enhance photos', order: 4, isFree: false },
    { title: 'Color Correction', description: 'Curves, levels, and color grading', order: 5, isFree: false },
    { title: 'Text and Typography', description: 'Working with text in Photoshop', order: 6, isFree: false },
  ],
  'Figma UI Design for Beginners': [
    { title: 'Figma Introduction', description: 'Getting started with Figma', order: 1, isFree: true },
    { title: 'Frames and Shapes', description: 'Basic design elements', order: 2, isFree: true },
    { title: 'Auto Layout', description: 'Responsive design with auto layout', order: 3, isFree: false },
    { title: 'Components', description: 'Reusable design components', order: 4, isFree: false },
    { title: 'Prototyping', description: 'Link frames to create prototypes', order: 5, isFree: false },
  ],
  'Digital Marketing Complete Guide': [
    { title: 'Digital Marketing Overview', description: 'Channels and strategies', order: 1, isFree: true },
    { title: 'SEO Basics', description: 'Rank higher on Google', order: 2, isFree: true },
    { title: 'Social Media Marketing', description: 'Instagram, Facebook, LinkedIn', order: 3, isFree: false },
    { title: 'Email Marketing', description: 'Build and grow email lists', order: 4, isFree: false },
    { title: 'Google Ads', description: 'Pay per click advertising', order: 5, isFree: false },
    { title: 'Analytics', description: 'Track and measure results', order: 6, isFree: false },
  ],
  'SEO Mastery — Rank #1 on Google': [
    { title: 'SEO Fundamentals', description: 'How search engines work', order: 1, isFree: true },
    { title: 'Keyword Research', description: 'Find the right keywords', order: 2, isFree: true },
    { title: 'On-Page SEO', description: 'Optimize your content', order: 3, isFree: false },
    { title: 'Technical SEO', description: 'Site speed, mobile, structured data', order: 4, isFree: false },
    { title: 'Link Building', description: 'Get high quality backlinks', order: 5, isFree: false },
    { title: 'Local SEO', description: 'Rank for local searches', order: 6, isFree: false },
  ],
  'TypeScript for React Developers': [
    { title: 'TypeScript Basics', description: 'Types, interfaces, and generics', order: 1, isFree: true },
    { title: 'TypeScript with React', description: 'Typed components and props', order: 2, isFree: true },
    { title: 'Hooks with TypeScript', description: 'useState, useEffect with types', order: 3, isFree: false },
    { title: 'Redux Toolkit with TypeScript', description: 'Fully typed Redux store', order: 4, isFree: false },
    { title: 'API Integration', description: 'Typed API calls with Axios', order: 5, isFree: false },
  ],
  'Docker & Kubernetes for Developers': [
    { title: 'Docker Introduction', description: 'Containers and why they matter', order: 1, isFree: true },
    { title: 'Dockerfile', description: 'Build custom Docker images', order: 2, isFree: true },
    { title: 'Docker Compose', description: 'Multi-container applications', order: 3, isFree: false },
    { title: 'Kubernetes Basics', description: 'Pods, services, deployments', order: 4, isFree: false },
    { title: 'CI/CD Pipeline', description: 'Automated deployment with GitHub Actions', order: 5, isFree: false },
    { title: 'Production Deployment', description: 'Deploy to AWS EKS', order: 6, isFree: false },
  ],
  'AWS Cloud Practitioner Certification': [
    { title: 'Cloud Computing Basics', description: 'What is cloud computing', order: 1, isFree: true },
    { title: 'AWS Core Services', description: 'EC2, S3, RDS, Lambda', order: 2, isFree: true },
    { title: 'AWS Security', description: 'IAM, VPC, security groups', order: 3, isFree: false },
    { title: 'AWS Pricing', description: 'Understanding AWS billing', order: 4, isFree: false },
    { title: 'Practice Exam', description: 'Mock exam questions', order: 5, isFree: false },
  ],
  'GraphQL with Node.js & React': [
    { title: 'GraphQL Introduction', description: 'Why GraphQL over REST', order: 1, isFree: true },
    { title: 'Queries and Mutations', description: 'Fetch and modify data', order: 2, isFree: true },
    { title: 'Apollo Server', description: 'Build a GraphQL API', order: 3, isFree: false },
    { title: 'Apollo Client', description: 'Connect React to GraphQL', order: 4, isFree: false },
    { title: 'Subscriptions', description: 'Real-time data with GraphQL', order: 5, isFree: false },
    { title: 'Authentication', description: 'Secure your GraphQL API', order: 6, isFree: false },
  ]
}

const seedLectures = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // delete all existing lectures
    await Lecture.deleteMany({})
    console.log('Cleared existing lectures')

    // get all courses
    const courses = await Course.find({})
    console.log(`Found ${courses.length} courses`)

    let totalLectures = 0

    for (const course of courses) {
      const lectures = lecturesData[course.title]

      if (!lectures) {
        console.log(`No lectures defined for: ${course.title}`)
        continue
      }

      const createdLectures = []

      for (const lecture of lectures) {
        const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)]

        const created = await Lecture.create({
          title: lecture.title,
          description: lecture.description,
          course: course._id,
          videoUrl: randomVideo,
          order: lecture.order,
          isFree: lecture.isFree,
          duration: Math.floor(Math.random() * 20) + 5
        })

        createdLectures.push(created._id)
        totalLectures++
      }

      // update course with lecture ids and total duration
      await Course.findByIdAndUpdate(course._id, {
        lectures: createdLectures,
        totalDuration: createdLectures.length * 15
      })

      console.log(`✅ Added ${createdLectures.length} lectures to: ${course.title}`)
    }

    console.log(`\n🎉 Successfully created ${totalLectures} lectures across ${courses.length} courses!`)
    process.exit(0)
  } catch (err) {
    console.error('Error seeding lectures:', err)
    process.exit(1)
  }
}

seedLectures()