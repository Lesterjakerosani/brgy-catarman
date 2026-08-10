import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("rememberMe").optional().isBoolean().toBoolean(),
];

export const changePasswordValidator = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
  body("newPassword").isString().isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
];

export const updateOwnProfileValidator = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
];
