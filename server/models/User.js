const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // real identity — only you (god) can see this
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },

  // public identity
  username: {
    type: String,
    unique: true,
    sparse: true // allows multiple users with no username (anonymous)
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },

  // account type
  isAnonymous: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'elevated', 'god'],
    default: 'user'
  },

  // creator stats
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // verification
  isVerified: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);