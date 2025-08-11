const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: String,
  path: String, // This will now hold the Cloudinary URL
  public_id: String, // For future deletion if needed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Image', imageSchema);
