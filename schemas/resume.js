const Joi = require("joi");

const experienceSchema = Joi.object({
  company: Joi.string().required(),
  position: Joi.string().required(),
  startDate: Joi.date().max(new Date()).required(),
  endDate: Joi.date().allow(null).min(Joi.ref("startDate")).optional(),
  description: Joi.string().allow("").optional(),
  id: Joi.number().optional(),
  resumeId: Joi.number().optional(),
});

const educationSchema = Joi.object({
  institution: Joi.string().required(),
  degree: Joi.string().required(),
  field: Joi.string().required(),
  startDate: Joi.date().max(new Date()).required(),
  endDate: Joi.date().allow(null).min(Joi.ref("startDate")).optional(),
  id: Joi.number().optional(),
  resumeId: Joi.number().optional(),
});

const skillSchema = Joi.object({
  name: Joi.string().required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Expert").required(),
  id: Joi.number().optional(),
  resumeId: Joi.number().optional(),
});

const createResumeSchema = Joi.object({
  title: Joi.string().required(),
  summary: Joi.string().allow("").optional(),
  experiences: Joi.array().items(experienceSchema).optional(),
  educations: Joi.array().items(educationSchema).optional(),
  skills: Joi.array().items(skillSchema).optional(),
});

const updateResumeSchema = Joi.object({
  experiences: Joi.array().items(experienceSchema).optional(),
  educations: Joi.array().items(educationSchema).optional(),
  skills: Joi.array().items(skillSchema).optional(),
});

module.exports = { updateResumeSchema, createResumeSchema };
