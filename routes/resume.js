const express = require("express");
const { authenticate } = require("../middleware/auth");
const prisma = require("../prisma");

const { createResumeSchema, updateResumeSchema } = require("../schemas/resume");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

// Create new resume
router.post(
  "/",
  authenticate,
  validateRequest(createResumeSchema),
  async (req, res) => {
    try {
      const { title, summary, experiences, educations, skills } = req.body;

      const resume = await prisma.resume.create({
        data: {
          title,
          summary,
          userId: req.user.id,
          experiences: {
            create: experiences,
          },
          educations: {
            create: educations,
          },
          skills: {
            create: skills,
          },
        },
        include: {
          experiences: true,
          educations: true,
          skills: true,
        },
      });

      res.status(201).json({ message: "Resume created successfully", resume });
    } catch (error) {
      console.warn("resume create", error);
      res.status(400).json({ message: "Resume creation failed" });
    }
  }
);

// Get all user's resumes
router.get("/", authenticate, async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      include: {
        experiences: true,
        educations: true,
        skills: true,
      },
    });

    res.json({ message: "Resumes are fetched", data: resumes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

// Get single resume
router.get("/:id", authenticate, async (req, res) => {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        experiences: true,
        educations: true,
        skills: true,
      },
    });

    if (!resume || resume.userId !== req.user.id) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ message: "Resume data is fetched", data: resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

// Update resume
router.put(
  "/:id",
  authenticate,
  validateRequest(updateResumeSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, summary, experiences, educations, skills } = req.body;

      // Verify resume ownership
      const existingResume = await prisma.resume.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingResume || existingResume.userId !== req.user.id) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Using transaction to ensure data consistency
      await prisma.$transaction([
        // Update main resume data
        prisma.resume.update({
          where: { id: parseInt(id) },
          data: {
            title,
            summary,
            updatedAt: new Date(),
          },
        }),

        // Delete existing relations
        prisma.experience.deleteMany({ where: { resumeId: parseInt(id) } }),
        prisma.education.deleteMany({ where: { resumeId: parseInt(id) } }),
        prisma.skill.deleteMany({ where: { resumeId: parseInt(id) } }),

        // Create new relations
        prisma.experience.createMany({
          data: experiences.map((exp) => ({
            ...exp,
            resumeId: parseInt(id),
          })),
        }),
        prisma.education.createMany({
          data: educations.map((edu) => ({
            ...edu,
            resumeId: parseInt(id),
          })),
        }),
        prisma.skill.createMany({
          data: skills.map((skill) => ({
            ...skill,
            resumeId: parseInt(id),
          })),
        }),
      ]);

      const fullResume = await prisma.resume.findUnique({
        where: { id: parseInt(id) },
        include: {
          experiences: true,
          educations: true,
          skills: true,
        },
      });

      res.json({ message: "Resume updated successfully", resume: fullResume });
    } catch (error) {
      console.error("Resume update error:", error);
      res.status(400).json({ message: "Resume update failed" });
    }
  }
);

// Delete resume
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!resume || resume.userId !== req.user.id) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.skill.deleteMany({ where: { resumeId: resume.id } }),
      prisma.experience.deleteMany({ where: { resumeId: resume.id } }),
      prisma.education.deleteMany({ where: { resumeId: resume.id } }),
      prisma.resume.delete({ where: { id: resume.id } }),
    ]);

    return res.status(201).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Failed to delete resume" });
  }
});

module.exports = router;
