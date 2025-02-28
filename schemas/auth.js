const Joi = require("joi");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base": "Password must contain letters and numbers",
    }),
  name: Joi.string().allow("").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { signupSchema, loginSchema };
