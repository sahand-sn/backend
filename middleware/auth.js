const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (err) {
    console.warn("authenticate", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };
