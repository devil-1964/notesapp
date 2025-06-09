const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { registerSchema, loginSchema } = require("../schemas/zodSchemas");
const { ZodError } = require("zod");

const register = async (req, res) => {
  let connection;
  try {
    const validData = registerSchema.parse(req.body);
    const { username, email, password } = validData;

    connection = await db.getConnection();

    const [rows] = await db.query(
      "SELECT 1 FROM users WHERE email=? OR username=?",
      [email, username]
    );

    if (rows.length > 0) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users(username, email, password) VALUES(?,?,?)",
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err) => err.message),
      });
    }

    console.error("Registration error", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
  finally {
    if (connection) await connection.release();
  }

};

const login = async (req, res) => {
  let connection;
  try {
    const { emailOrUsername, password } = loginSchema.parse(req.body);
    connection = await db.getConnection();
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email=? OR username=?",
      [emailOrUsername, emailOrUsername]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login Successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    if (connection) await connection.release();
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((err) => err.message),
      });
    }
    console.log("Login error:", error);
    res.status(500).json({ error: "Internal Error" });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = { register, login };
