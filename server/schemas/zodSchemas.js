const { z } = require("zod");
const registerSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(15, "Username cannot exceed 15 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
