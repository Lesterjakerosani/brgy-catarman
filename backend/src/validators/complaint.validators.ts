import { body } from "express-validator";

export const submitComplaintValidator = [
  body("reporterName").isString().trim().notEmpty(),
  body("reporterPhone").isString().trim().notEmpty(),
  body("reporterEmail").isEmail(),
  body("reportedPerson").optional().isString(),
  body("category").isIn([
    "LOITERING",
    "NOISE_COMPLAINT",
    "ILLEGAL_PARKING",
    "PUBLIC_DISTURBANCE",
    "ILLEGAL_DUMPING",
    "VANDALISM",
    "OTHER",
  ]),
  body("otherCategoryLabel").optional().isString(),
  body("location").isString().trim().notEmpty(),
  body("latitude").optional().isFloat(),
  body("longitude").optional().isFloat(),
  body("incidentDate").isISO8601(),
  body("incidentTime").isString().trim().notEmpty(),
  body("description").isString().trim().isLength({ min: 10 }),
];

export const updateComplaintStatusValidator = [
  body("status").isIn(["NEW", "UNDER_REVIEW", "VALIDATED", "RESOLVED", "ARCHIVED", "DISMISSED"]),
  body("staffNotes").optional().isString(),
];

export const addPhotoValidator = [
  body("type").isIn(["REPORTER_CAPTURE", "EVIDENCE"]),
  body("source").isIn(["LIVE_CAMERA", "FILE_UPLOAD"]),
  body("latitude").optional().isFloat(),
  body("longitude").optional().isFloat(),
];
