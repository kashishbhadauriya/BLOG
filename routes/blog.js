const express = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');

const router = express.Router();

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






router.get('/add-new', (req, res) => {
  if (!req.user) return res.redirect('/user/signin');
  res.render('addblog', { user: req.user });
});


router.post('/', upload.single('coverimage'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const coverImagePath = req.file ? `/uploads/${req.file.filename}` : null;

   await Blog.create({
      title,
      body,
      coverImageURL: coverImagePath,
      createdBy: res.locals.user._id  // ✅ FIXED HERE
    });

    res.redirect('/blog/myblog');
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(500).send("Failed to create blog.");
  }
});



// ✅ Show all blogs (for /allblog)
router.get('/allblog', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('createdBy');

    console.log('Fetched Blogs:', blogs); // ✅ log this
    console.log('User:', res.locals.user); // ✅ also log this

    res.render('allblog', { blogs, user: res.locals.user });
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    res.status(500).send("Server Error"); // show something if error occurs
  }
});




// 👇 add this route
router.get('/myblog', async (req, res) => {
  try {
    const user = req.user; // assuming you're using auth middleware and req.user is available
    const blogs = await Blog.find({ createdBy: user._id }).populate('createdBy');
    res.render('myblog', { blogs, user });
  } catch (err) {
    console.error("Error fetching user's blogs:", err);
    res.status(500).send("Server error");
  }
});




// Search route
router.get('/search', async (req, res) => {
  console.log("✅ /blog/search route HIT");
  const query = req.query.query;
  try {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } }
      ]
    });
    console.log("Blogs found:", blogs.length);
    res.render('searchResults', { blogs, query });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// Inside routes/blog.js
// 🧾 Blog Details + Comments
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('createdBy')
      .populate({
        path: 'comments',
        populate: { path: 'createdBy' }
      });

    if (!blog) return res.status(404).send('Blog not found');
    res.render('blogdetails', { blog, currentUser: req.user });
  } catch (err) {
    console.error('Error fetching blog by ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send('Blog not found');

    const userId = req.user?._id || req.session?.userId;
    if (!userId) return res.status(401).send('Unauthorized');

    blog.comments.push({
      text: req.body.comment,
      createdBy: userId,
    });

    await blog.save();
    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).send('Server Error');
  }
});



// Like Blog Route// ✅ Correct route path
router.post('/:id/like', async (req, res) => {
  try {
    console.log("➡️ Blog like route hit");
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Blog not found");

    const userId = req.user._id.toString();
    const index = blog.likes.findIndex(id => id.toString() === userId);

    if (index === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(index, 1);
    }

    await blog.save();
    res.redirect(`/blog/${req.params.id}#top`);
  } catch (err) {
    console.error("🔥 Blog like error:", err);
    res.status(500).send("Internal Server Error");
  }
});










module.exports = router;
