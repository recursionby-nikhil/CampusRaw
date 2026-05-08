const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// god-only middleware
const godOnly = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'god') return res.status(403).json({ message: 'Gods only.' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// GET PLATFORM STATS
router.get('/stats', godOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalPosts = await Post.countDocuments()
    const flaggedPosts = await Post.countDocuments({ isFlagged: true })
    const removedPosts = await Post.countDocuments({ isRemoved: true })
    const elevatedUsers = await User.countDocuments({ role: 'elevated' })
    const universities = await User.distinct('university')

    res.json({
      totalUsers, totalPosts, flaggedPosts,
      removedPosts, elevatedUsers,
      totalUniversities: universities.length
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// GET ALL FLAGGED POSTS
router.get('/flagged', godOnly, async (req, res) => {
  try {
    const posts = await Post.find({ isFlagged: true, isRemoved: false })
      .populate('author', 'username university email')
      .sort({ flagCount: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// REMOVE A POST
router.patch('/posts/:id/remove', godOnly, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isRemoved: true })
    res.json({ message: 'Post removed.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// CLEAR FLAG ON A POST
router.patch('/posts/:id/clearflag', godOnly, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isFlagged: false, flagCount: 0 })
    res.json({ message: 'Flag cleared.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// GET ALL USERS
router.get('/users', godOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// ELEVATE / DEMOTE USER
router.patch('/users/:id/role', godOnly, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'elevated'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' })
    }
    await User.findByIdAndUpdate(req.params.id, { role })
    res.json({ message: `User role updated to ${role}.` })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router;