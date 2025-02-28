const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const { loginSchema, signupSchema } = require("../schemas/auth");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", validateRequest(signupSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({ data: { token }, message: "New member was created" });
  } catch (error) {
    console.warn("/signup", error);
    res.status(400).json({ message: "Registration failed" });
  }
});

router.post("/login", validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("user not found or incorrect password");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ data: { token }, message: "Credentials were accepted" });
  } catch (error) {
    console.warn("/login", error);
    res.status(401).json({ message: "Invalid credentials" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ data: { user: req.user }, message: `Welcome ${req.user.name}` });
});

module.exports = router;
