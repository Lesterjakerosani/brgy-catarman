import { body } from "express-validator";

export const documentTypeValidator = [
  body("name").isString().trim().notEmpty(),
  body("code").isString().trim().notEmpty(),
  body("description").optional().isString(),
  body("requirements").optional().isArray(),
  body("fee").optional().isFloat({ min: 0 }),
  body("validityDays").optional().isInt({ min: 1 }),
  body("isActive").optional().isBoolean().toBoolean(),
];

export const certificateTemplateValidator = [
  body("name").isString().trim().notEmpty(),
  body("documentTypeId").isUUID(),
  body("bodyHtml").isString().notEmpty(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  body("requireResidentPhoto").optional().isBoolean().toBoolean(),
  body("showBarangayLogo").optional().isBoolean().toBoolean(),
  body("showMunicipalLogo").optional().isBoolean().toBoolean(),
  body("showBarangayDrySeal").optional().isBoolean().toBoolean(),
  body("logoSize").optional().isInt({ min: 20, max: 300 }),
];

export const publicCertificateRequestValidator = [
  body("documentTypeId").isUUID(),
  body("requestorName").isString().trim().notEmpty(),
  body("address").isString().trim().notEmpty(),
  body("contactNumber").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("purpose").isString().trim().notEmpty(),
  body("residentId").optional().isUUID(),
];

export const updateCertificateStatusValidator = [
  body("status").isIn([
    "PENDING",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "READY_FOR_CLAIM",
    "CLAIMED",
    "NOT_CLAIMED",
    "EXPIRED",
  ]),
  body("rejectionReason").optional().isString(),
  body("staffNotes").optional().isString(),
  body("extendDays").optional().isInt({ min: 1 }),
  body("claimedBy").optional().isString(),
];
