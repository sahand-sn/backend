const Joi = require("joi");

const itemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  ingredients: Joi.array().min(1).max(10).items(Joi.string()).required(),
  image: Joi.object({
    mimetype: Joi.string()
      .valid("image/jpeg", "image/png", "image/webp")
      .required(),
    size: Joi.number().max(5 * 1024 * 1024), // 5MB limit
  })
    .unknown()
    .optional(),
});

const sectionSchema = Joi.object({
  name: Joi.string().required(),
  items: Joi.array().min(1).max(20).items(itemSchema),
});

const menuSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  location: Joi.string().allow(""),
  contact: Joi.string().allow(""),
  sections: Joi.array().min(1).max(10).items(sectionSchema),
}).unknown(true);

module.exports = { itemSchema, sectionSchema, menuSchema };
