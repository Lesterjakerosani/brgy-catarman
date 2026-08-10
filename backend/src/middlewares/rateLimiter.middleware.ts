import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse.util";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many attempts. Please try again later.");
  },
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests. Please try again later.");
  },
});

// Tighter than publicLimiter: this hits a paid, per-call external API, so an
// anonymous visitor should not be able to run up a real bill.
export const aiAssistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "You've sent a lot of messages. Please wait a bit before trying again.");
  },
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests. Please try again later.");
  },
});
