const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware — verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, access denied.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// CREATE POST
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, videoUrl, type, isAnonymous, visibility } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const post = new Post({
      title,
      description,
      videoUrl,
      type: type || 'clip',
      isAnonymous: isAnonymous || false,
      author: user._id,
      university: user.university,
      country: user.country,
      visibility: visibility || 'campus'
    });

    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET CAMPUS FEED
router.get('/feed/campus', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const posts = await Post.find({
      university: user.university,
      isRemoved: false
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar university isAnonymous').populate('comments.user', 'username');

    // hide author info for anonymous posts
    const sanitized = posts.map(post => {
      const p = post.toObject();
      if (p.isAnonymous && !p.isUncovered) {
        p.author = { university: p.university };
      }
      return p;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET NATIONAL FEED
router.get('/feed/national', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const posts = await Post.find({
      country: user.country,
      visibility: { $in: ['national', 'global'] },
      isRemoved: false
    })
    .sort({ heatScore: -1, createdAt: -1 })
    .populate('author', 'username avatar university isAnonymous').populate('comments.user', 'username');

    const sanitized = posts.map(post => {
      const p = post.toObject();
      if (p.isAnonymous && !p.isUncovered) {
        p.author = { university: p.university };
      }
      return p;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET GLOBAL FEED
router.get('/feed/global', auth, async (req, res) => {
  try {
    const posts = await Post.find({
      visibility: 'global',
      isRemoved: false
    })
    .sort({ heatScore: -1, createdAt: -1 })
    .populate('author', 'username avatar university isAnonymous').populate('comments.user', 'username');

    const sanitized = posts.map(post => {
      const p = post.toObject();
      if (p.isAnonymous && !p.isUncovered) {
        p.author = { university: p.university };
      }
      return p;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// RATE A POST (fire, chaotic, important, cringe, wholesome)
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { vibe } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // remove existing rating from this user
    post.ratings = post.ratings.filter(r => r.user.toString() !== req.user.id);

    // add new rating
    post.ratings.push({ user: req.user.id, vibe });

    // recalculate heat score
    const vibeWeights = { fire: 5, important: 4, chaotic: 3, wholesome: 2, cringe: 1 };
    const totalWeight = post.ratings.reduce((sum, r) => sum + (vibeWeights[r.vibe] || 0), 0);
    const commentBoost = post.comments.length * 0.5;
    const viewBoost = post.views * 0.01;
    post.heatScore = totalWeight + commentBoost + viewBoost;

    // auto promote based on heat
    if (post.heatScore > 100) post.visibility = 'global';
    else if (post.heatScore > 40) post.visibility = 'national';

    await post.save();
    res.json({ heatScore: post.heatScore, visibility: post.visibility });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ADD COMMENT
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const user = await User.findById(req.user.id).select('username');

    post.comments.push({
      user: req.user.id,
      text,
      isAnonymous: isAnonymous || false
    });

    post.heatScore += 0.5;
    if (post.heatScore > 100) post.visibility = 'global';
    else if (post.heatScore > 40) post.visibility = 'national';

    await post.save();

    const newComment = post.comments[post.comments.length - 1].toObject()
    newComment.user = { username: user.username }

    res.json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// UNCOVER ANONYMOUS POST
router.patch('/:id/uncover', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // only the original author can uncover
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can uncover this post.' });
    }

    post.isUncovered = true;
    await post.save();

    res.json({ message: 'You have been revealed. 👀', post });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// FLAG A POST
router.patch('/:id/flag', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.flagCount += 1;
    if (post.flagCount >= 10) post.isFlagged = true;

    await post.save();
    res.json({ message: 'Post flagged for review.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET USER POSTS
router.get('/user/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const posts = await Post.find({ 
      author: user._id, 
      isRemoved: false,
      // only show anonymous posts if it's the user viewing their own profile
      ...(req.user.id !== user._id.toString() && { isAnonymous: false })
    })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar university isAnonymous')

    res.json({ user, posts })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})
module.exports = router;