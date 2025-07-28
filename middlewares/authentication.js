const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null;
    req.user = null;
    return next();
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    // 🟢 Set user properly
    res.locals.user = decodedUser || null;
    req.user = decodedUser || null;
  } catch (err) {
    console.error("Invalid token:", err.message);
    res.locals.user = null;
    req.user = null;
  }

  next();
}

module.exports = authenticateUser;
