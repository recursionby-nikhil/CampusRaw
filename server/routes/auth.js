const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper — check if email is a valid university email
const isUniversityEmail = (email) => {
  const validDomains = ['.edu', '.ac.in', '.ac.uk', '.edu.au', '.ac.nz', '.edu.sg'];
  return validDomains.some(domain => email.endsWith(domain));
};

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, university, country, isAnonymous } = req.body;

    // check university email
    if (!isUniversityEmail(email)) {
      return res.status(400).json({ message: 'Please use your university email address.' });
    }

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // check if username taken (only for named accounts)
    if (!isAnonymous && username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken.' });
      }
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = new User({
      email,
      password: hashedPassword,
      university,
      country,
      username: isAnonymous ? null : username,
      isAnonymous: isAnonymous || false
    });

    await user.save();

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        university: user.university,
        country: user.country,
        isAnonymous: user.isAnonymous,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        university: user.university,
        country: user.country,
        isAnonymous: user.isAnonymous,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;