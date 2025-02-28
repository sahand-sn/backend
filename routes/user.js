const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      throw new Error();
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "User data could not be found" });
  }
});

module.exports = router;
