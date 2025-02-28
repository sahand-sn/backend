// middleware/imageHandler.js
import Joi from "joi";

export const validateImageFile = (req, res, next) => {
  if (!req.file) return next(); // Image is optional

  const { error } = Joi.object({
    mimetype: Joi.string()
      .valid("image/jpeg", "image/png", "image/webp")
      .required(),
    size: Joi.number().max(5 * 1024 * 1024),
  }).validate(req.file);

  if (error) {
    return res.status(400).json({
      message: "Invalid image file: Must be JPEG/PNG/WEBP under 5MB",
    });
  }

  // Convert to base64
  req.body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
    "base64"
  )}`;
  next();
};
