const express = require("express");
const prisma = require("../prisma");

const { itemSchema, menuSchema, sectionSchema } = require("../schemas/menu");
const { validateBody } = require("../middleware/schema");

const router = express.Router();

router.post("/", validateBody(menuSchema), async (req, res) => {
  try {
    const { sections, ...menuData } = req.body;

    const menu = await prisma.menu.create({
      data: {
        ...menuData,
        userId: req.userId,
        sections: {
          create: sections.map((section) => ({
            ...section,
            items: {
              create: section.items.map((item) => ({
                ...item,
                // Convert image object to base64 string if provided
                image: item.image
                  ? Buffer.from(item.image.data).toString("base64")
                  : null,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
    });

    res.json({ message: "Menu created successfully!", id: menu.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { userId: req.userId },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
    });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", validateBody(menuSchema), async (req, res) => {
  try {
    const menuId = req.params.id;
    const { sections, ...menuData } = req.body;

    // Verify menu ownership
    const existingMenu = await prisma.menu.findFirst({
      where: { id: menuId, userId: req.userId },
    });
    if (!existingMenu) return res.status(404).json({ error: "Menu not found" });

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...menuData,
        sections: {
          deleteMany: {},
          create: sections.map((section) => ({
            ...section,
            items: {
              create: section.items.map((item) => ({
                ...item,
                image: item.image
                  ? Buffer.from(item.image.data).toString("base64")
                  : null,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
    });

    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const menuId = req.params.id;

    // Verify menu ownership
    const existingMenu = await prisma.menu.findFirst({
      where: { id: menuId, userId: req.userId },
    });
    if (!existingMenu) return res.status(404).json({ error: "Menu not found" });

    await prisma.menu.delete({ where: { id: menuId } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
