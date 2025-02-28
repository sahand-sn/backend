import Joi from "joi";

export const menuSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  location: Joi.string().allow(""),
  contact: Joi.string().allow(""),
});

export const sectionSchema = Joi.object({
  name: Joi.string().required(),
  order: Joi.number().integer().min(0),
  menuId: Joi.string().required(),
});

// schemas/index.js
export const itemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  ingredients: Joi.array().items(Joi.string()).required(),
  image: Joi.object({
    mimetype: Joi.string()
      .valid("image/jpeg", "image/png", "image/webp")
      .required(),
    size: Joi.number().max(5 * 1024 * 1024), // 5MB limit
  })
    .unknown()
    .optional(),
  sectionId: Joi.string().required(),
});
