const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

  // content
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['clip', 'video', 'story'],
    default: 'clip'
  },

  // identity — the anonymous magic
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // always stored — god sees everything
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isUncovered: {
    type: Boolean,
    default: false // creator can flip this to true later
  },

  // campus info
  university: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },

  // the unique rating system
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vibe: {
      type: String,
      enum: ['fire', 'chaotic', 'important', 'cringe', 'wholesome']
    }
  }],
  heatScore: {
    type: Number,
    default: 0 // calculated from ratings + comments + time
  },

  // engagement
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },

  // feed visibility
  visibility: {
    type: String,
    enum: ['campus', 'national', 'global'],
    default: 'campus' // starts local, community promotes it
  },

  // moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagCount: {
    type: Number,
    default: 0
  },
  isRemoved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);