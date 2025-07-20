// Load environment variables
require("dotenv").config();

// Core imports
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

// Middleware
const authenticateUser = require('./middlewares/authentication');

// Initialize app
const app = express();
const PORT = 8000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection error", err);
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authenticateUser); // ✅ JWT middleware

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');

app.use('/user', userRouter);
app.use('/blog', blogRouter);

// Home route
app.get("/", (req, res) => {
  res.render("home", { user: res.locals.user });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
