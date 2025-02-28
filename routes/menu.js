const express = require("express");
const prisma = require("../prisma");
const multer = require("multer");

const { menuSchema } = require("../schemas/menu");
const { validateBody } = require("../middleware/schema");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.any(), validateBody(menuSchema), async (req, res) => {
  try {
    const { sections, ...menuData } = req.body;

    const menu = await prisma.menu.create({
      data: {
        ...menuData,
        userId: req.user.id,
        sections: {
          create: sections?.map((section) => ({
            ...section,
            items: {
              create: section?.items?.map((item) => ({
                ...item,
                // Convert image object to base64 string if provided
                image: item?.image
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
    console.error(error);
    res.status(500).json({ error: "Could not add new menu" });
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

router.get("/:id", async (req, res) => {
  try {
    const menu = await prisma.menu.findFirst({
      where: { userId: req.user.id, id: req.params.id },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
    });

    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Menu was not found" });
  }
});

router.put("/:id", upload.any(), validateBody(menuSchema), async (req, res) => {
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
          create: sections?.map((section) => ({
            ...section,
            items: {
              create: section?.items?.map((item) => ({
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

    res.json({ menu: updatedMenu, message: "Menu updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update menu" });
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

    // Delete all related items and sections first
    await prisma.$transaction([
      prisma.item.deleteMany({
        where: {
          section: {
            menuId: menuId,
          },
        },
      }),
      prisma.section.deleteMany({
        where: {
          menuId: menuId,
        },
      }),
      prisma.menu.delete({
        where: { id: menuId },
      }),
    ]);

    res.status(200).json({ message: "Menu deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete menu" });
  }
});

module.exports = router;
