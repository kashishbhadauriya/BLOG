const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.cookies.token; // Token stored in cookie

  if (!token) {
    res.locals.user = null;
    req.user = null;
    return next(); // Proceed even if user not logged in
  }

  try {
    const decodedUserFromJWT = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Yeh do line yahi likhni hoti hain:
    res.locals.user = decodedUserFromJWT;
    req.user = decodedUserFromJWT;
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.locals.user = null;
    req.user = null;
  }

  next(); // Move to next middleware/route
}

module.exports = authenticateUser;
