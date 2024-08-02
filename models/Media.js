const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, required: true, maxlength: 200 },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true }
});

module.exports = mongoose.model('Media', mediaSchema);
