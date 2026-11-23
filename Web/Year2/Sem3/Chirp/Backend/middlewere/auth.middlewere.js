const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "coding";

const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({ msg: "Login First" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id || decoded._id,
      userId: decoded.userId || decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role || "user",
      name: decoded.name,
    };
    next();
  } catch (error) {
    return res.status(401).send({ msg: "Invalid or expired token. Login First." });
  }
};

// Role-Based Access Control (RBAC) middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "Access denied: Insufficient permissions for this resource.",
      });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };
