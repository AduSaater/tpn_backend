const jwt = require("jsonwebtoken");

module.exports = (allowedRoles) => (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    if (!allowedRoles.includes(decoded.userType)) {
      console.log("Unauthorized role:", decoded.userType);
      return res.status(403).json({ message: "Unauthorized role" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.stack);
    res.status(401).json({ message: "Token is not valid" });
  }
};
