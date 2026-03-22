import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// for course thumbnail images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'learnify/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
})

// for lecture videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'learnify/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'mov']
  }
})

export const uploadImage = multer({ storage: imageStorage })
export const uploadVideo = multer({ storage: videoStorage })
export { cloudinary }