const jwt = require("jsonwebtoken");

/*  VERIFY TOKEN */
exports.verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token was issued by THIS server instance:
    if (decoded.instanceId && decoded.instanceId !== global.SERVER_INSTANCE_ID) {
      // Token is from old server instance — clear cookies and force re-login
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        error: 'Session expired — server was restarted. Please log in again.',
        code: 'SERVER_RESTARTED'
      });
    }

    // 🔒 Mandatory checks
    if (!decoded.id || !decoded.role || !decoded.collegeId) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      collegeId: decoded.collegeId
    };

    next();
  } catch (err) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/*  ROLE AUTHORIZATION  */
exports.authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.some(role => role.toLowerCase() === req.user.role.toLowerCase())) {
    console.error("🚫 [AUTH] 403 ACCESS DENIED.");
    console.error("👉 Required roles:", roles);
    console.error("👤 Current user:", req.user);
    console.error("📍 Route:", req.originalUrl);
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
