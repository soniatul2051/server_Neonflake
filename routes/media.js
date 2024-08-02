const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Media = require('../models/Media');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload route
router.post('/upload', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const thumbnail = req.files.thumbnail[0];
    const video = req.files.video[0];

    const thumbnailUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
          console.error('Thumbnail upload error:', error);
          reject(new Error('Thumbnail upload failed'));
        }
        resolve(result);
      }).end(thumbnail.buffer);
    });

    const videoUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'video' }, (error, result) => {
        if (error) {
          console.error('Video upload error:', error);
          reject(new Error('Video upload failed'));
        }
        resolve(result);
      }).end(video.buffer);
    });

    const media = new Media({
      title,
      description,
      thumbnailUrl: thumbnailUpload.secure_url,
      videoUrl: videoUpload.secure_url,
    });

    await media.save();
    res.status(201).json(media);
  } catch (err) {
    console.error('Upload route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.find();
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get media by ID (new route)
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
