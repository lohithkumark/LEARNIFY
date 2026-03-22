import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from './models/Course.js'
import User from './models/User.js'

dotenv.config()

const courses = [
  {
    title: 'Complete React.js Developer Course',
    description: 'Master React from scratch. Learn hooks, Redux, React Router, and build real world projects. Perfect for beginners and intermediate developers.',
    price: 999,
    category: 'Web Dev',
    level: 'Beginner'
  },
  {
    title: 'Node.js & Express Backend Mastery',
    description: 'Build scalable REST APIs with Node.js and Express. Learn middleware, authentication, file uploads, and deploy to production.',
    price: 1299,
    category: 'Web Dev',
    level: 'Intermediate'
  },
  {
    title: 'MongoDB & Mongoose Complete Guide',
    description: 'Deep dive into MongoDB. Learn schema design, aggregation pipelines, indexing, and advanced Mongoose techniques.',
    price: 799,
    category: 'Web Dev',
    level: 'Beginner'
  },
  {
    title: 'Full Stack MERN Development',
    description: 'Build complete web applications with MongoDB, Express, React and Node.js. Includes 5 real world projects with deployment.',
    price: 1999,
    category: 'Web Dev',
    level: 'Intermediate'
  },
  {
    title: 'JavaScript — The Complete Guide 2024',
    description: 'From basics to advanced JavaScript. Covers ES6+, async/await, closures, prototypes, and modern JS patterns.',
    price: 899,
    category: 'Web Dev',
    level: 'Beginner'
  },
  {
    title: 'Python for Data Science & ML',
    description: 'Learn Python programming for data analysis and machine learning. Covers NumPy, Pandas, Matplotlib, and Scikit-learn.',
    price: 1499,
    category: 'Data Science',
    level: 'Beginner'
  },
  {
    title: 'Machine Learning A-Z',
    description: 'Hands-on machine learning with Python and R. Learn regression, classification, clustering, and deep learning fundamentals.',
    price: 1799,
    category: 'Data Science',
    level: 'Intermediate'
  },
  {
    title: 'Deep Learning with TensorFlow',
    description: 'Build neural networks with TensorFlow and Keras. Covers CNNs, RNNs, transformers, and real world AI projects.',
    price: 2099,
    category: 'Data Science',
    level: 'Advanced'
  },
  {
    title: 'React Native — Build Mobile Apps',
    description: 'Create iOS and Android apps with React Native. Learn navigation, state management, device APIs, and app store deployment.',
    price: 1399,
    category: 'Mobile Dev',
    level: 'Intermediate'
  },
  {
    title: 'Flutter & Dart Complete Course',
    description: 'Build beautiful cross platform mobile apps with Flutter. Covers widgets, state management, Firebase integration, and animations.',
    price: 1299,
    category: 'Mobile Dev',
    level: 'Beginner'
  },
  {
    title: 'iOS Development with Swift',
    description: 'Learn iOS app development from scratch using Swift and Xcode. Build real apps and publish them to the App Store.',
    price: 1599,
    category: 'Mobile Dev',
    level: 'Beginner'
  },
  {
    title: 'UI/UX Design Masterclass',
    description: 'Master UI/UX design principles using Figma. Learn user research, wireframing, prototyping, and design systems.',
    price: 1099,
    category: 'Design',
    level: 'Beginner'
  },
  {
    title: 'Adobe Photoshop Complete Course',
    description: 'Learn Photoshop from beginner to advanced. Photo editing, digital art, graphic design, and professional retouching techniques.',
    price: 799,
    category: 'Design',
    level: 'Beginner'
  },
  {
    title: 'Figma UI Design for Beginners',
    description: 'Start designing modern user interfaces with Figma. Learn components, auto layout, design tokens, and collaboration.',
    price: 699,
    category: 'Design',
    level: 'Beginner'
  },
  {
    title: 'Digital Marketing Complete Guide',
    description: 'Master digital marketing — SEO, social media, email marketing, Google Ads, and analytics to grow any business online.',
    price: 999,
    category: 'Marketing',
    level: 'Beginner'
  },
  {
    title: 'SEO Mastery — Rank #1 on Google',
    description: 'Advanced SEO techniques to rank your website on Google. Keyword research, on-page SEO, backlinks, and technical SEO.',
    price: 1199,
    category: 'Marketing',
    level: 'Intermediate'
  },
  {
    title: 'TypeScript for React Developers',
    description: 'Add TypeScript to your React projects. Learn types, interfaces, generics, and how to build fully typed React applications.',
    price: 899,
    category: 'Web Dev',
    level: 'Intermediate'
  },
  {
    title: 'Docker & Kubernetes for Developers',
    description: 'Containerize your applications with Docker and orchestrate them with Kubernetes. Includes CI/CD pipeline setup.',
    price: 1699,
    category: 'Other',
    level: 'Advanced'
  },
  {
    title: 'AWS Cloud Practitioner Certification',
    description: 'Prepare for the AWS Cloud Practitioner exam. Learn core AWS services, cloud concepts, security, and pricing models.',
    price: 1499,
    category: 'Other',
    level: 'Beginner'
  },
  {
    title: 'GraphQL with Node.js & React',
    description: 'Build modern APIs with GraphQL. Learn queries, mutations, subscriptions, Apollo Server, and Apollo Client with React.',
    price: 1299,
    category: 'Web Dev',
    level: 'Advanced'
  }
]

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // find the instructor
    const instructor = await User.findOne({ role: 'instructor' })
    if (!instructor) {
      console.log('No instructor found! Please register an instructor first.')
      process.exit(1)
    }

    console.log(`Creating courses for instructor: ${instructor.name}`)

    // delete existing courses first
    await Course.deleteMany({})
    console.log('Cleared existing courses')

    // create all 20 courses
    const createdCourses = await Promise.all(
      courses.map((course) =>
        Course.create({
          ...course,
          instructor: instructor._id,
          isPublished: true
        })
      )
    )

    // add all courses to instructor's createdCourses
    await User.findByIdAndUpdate(instructor._id, {
      createdCourses: createdCourses.map((c) => c._id)
    })

    console.log(`✅ Successfully created ${createdCourses.length} courses!`)
    console.log('Courses created:')
    createdCourses.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.title} — ₹${c.price} — ${c.category}`)
    })

    process.exit(0)
  } catch (err) {
    console.error('Error seeding courses:', err)
    process.exit(1)
  }
}

seedCourses()