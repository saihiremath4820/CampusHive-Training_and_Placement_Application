const jwt = require("jsonwebtoken");

/*  VERIFY TOKEN */
exports.verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Mandatory checks
    if (!decoded.id || !decoded.role || !decoded.collegeId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      collegeId: decoded.collegeId
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/*  ROLE AUTHORIZATION  */
exports.authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.some(role => role.toLowerCase() === req.user.role.toLowerCase())) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
