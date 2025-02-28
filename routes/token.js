const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const { userSchema } = require("../schemas/user");
const { validateBody } = require("../middleware/schema");

const router = express.Router();

router.post("/signup", validateBody(userSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "User was not matched" });
  }
});

router.post("/login", validateBody(userSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "User was not matched" });
  }
});

module.exports = router;
