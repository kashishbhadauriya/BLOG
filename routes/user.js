// routes/user.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const User = require('../models/user');
const authenticateUser = require('../middlewares/authentication');


// Multer setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// GET: Signup page
router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
router.get("/signin", (req, res) => {
  res.render("signin", { error: null });
});



// POST: Signup
router.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('signup', {
        error: 'Email is already registered. Please sign in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ fullname, email, password: hashedPassword });

    // ✅ Create token
    const token = jwt.sign(
      { _id: user._id, fullname: user.fullname, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Set cookie
    res.cookie("token", token, { httpOnly: true });

    return res.redirect('/');
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).render('signup', {
      error: error.message || "Something went wrong.",
    });
  }
});


router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).render('signin', {
        error: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('signin', {
        error: 'Invalid email or password',
      });
    }

    // ✅ Create token
    const token = jwt.sign(
      { _id: user._id, fullname: user.fullname, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Set cookie
    res.cookie("token", token, { httpOnly: true });

    return res.redirect('/blog/add-new');
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).render('signin', {
      error: "Something went wrong.",
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie("token");
  res.redirect('/');
});

// GET: Add new blog form
router.get('/add-new', (req, res) => {
  res.render('addBlog', { user: req.user });
});

// POST: Create blog
router.post('/',upload.single('coverimage'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const coverImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    await Blog.create({
      title,
      body,
      coverImageURL: coverImagePath,
      createdBy: req.user._id
    });

    res.redirect('/myblogs');
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(500).send("Failed to create blog.");
  }
});

module.exports = router;
