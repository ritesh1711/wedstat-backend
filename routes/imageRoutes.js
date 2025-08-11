// /routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const imageController = require('../controllers/imageController');
// import upload from '../middlewares/uploadMiddleware';

// Image Upload (admin)
router.post(
  '/upload-multiple',
  upload.array('images', 30), // 'images' is the field name, 10 = max files
  imageController.uploadMultipleImages
);

// Get All Images
router.get('/', imageController.getAllImages);

module.exports = router;
