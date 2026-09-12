const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 *
 * Checks for a valid JWT token in the Authorization header.
 * If valid, attaches the decoded user info to req.user.
 * If missing or invalid, returns 401 Unauthorized.
 */
const auth = (req, res, next) => {
  // Get token from header: "Bearer <token>"
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for use in route handlers
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
