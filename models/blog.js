const mongoose = require('mongoose');

// Comment sub-schema
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

});

// Blog schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  coverImageURL: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [commentSchema],
    likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ] // 👈 comments added here
});

// ✅ Now it's valid!
module.exports = mongoose.model('Blog', blogSchema);
