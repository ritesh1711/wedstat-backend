const Image = require('../models/Image');
const { cloudinary } = require('../config/cloudinaryConfig');
const streamifier = require('streamifier'); // required to convert buffer to stream

// Upload a single image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log('Hit uploadImage route');
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'facefinder' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    const image = new Image({
      filename: result.original_filename,
      path: result.secure_url,
      public_id: result.public_id,
      userId,
    });

    await image.save();

    res.status(201).json({ success: true, message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

// Upload multiple images to Cloudinary
exports.uploadMultipleImages = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'facefinder' },
          async (error, result) => {
            if (result) {
              const image = new Image({
                filename: result.original_filename,
                path: result.secure_url,
                public_id: result.public_id,
                userId,
              });

              await image.save();
              resolve(image);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const savedImages = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      images: savedImages,
    });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    res.status(500).json({ success: false, message: 'Bulk upload failed' });
  }
};

// Get all images
exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images' });
  }
};
