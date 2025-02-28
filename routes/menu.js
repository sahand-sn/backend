const express = require("express");
const prisma = require("../prisma");

const { itemSchema, menuSchema, sectionSchema } = require("../schemas/menu");
const { validateBody } = require("../middleware/schema");

const router = express.Router();

module.exports = router;
