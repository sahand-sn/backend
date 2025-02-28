const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const { loginSchema, signupSchema } = require("../schemas/auth");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

module.exports = router;
