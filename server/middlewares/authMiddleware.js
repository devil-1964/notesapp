const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      "SELECT id, username, email FROM users WHERE id=?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = users[0];

    next();
  } catch (error) {
    console.error("Authenticated error", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid Token",
      });
    }
    res.status(500).json({
      error: "Authentication failed",
    });
  }
};

module.exports = { authenticate };
