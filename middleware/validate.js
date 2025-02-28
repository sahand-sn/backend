const Joi = require("joi");

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false,
      });
      next();
    } catch (error) {
      console.warn("validateRequest", error);
      if (error instanceof Joi.ValidationError) {
        const message = error.details.map((detail) => detail.message);
        return res.status(400).json({ message });
      }
      res.status(500).json({ message: "Validation failed" });
    }
  };
};

module.exports = { validateRequest };
