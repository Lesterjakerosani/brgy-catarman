import { Request } from "express";
import { userRepository } from "../repositories/user.repository";
import { sessionRepository } from "../repositories/session.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { activityLogRepository } from "../repositories/activityLog.repository";
import { hashPassword, verifyPassword } from "../utils/hash.util";
import { ApiError } from "../utils/apiError.util";
import { tokenService } from "./token.service";
import { activityLogService } from "./activityLog.service";

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: "STAFF" | "ADMINISTRATOR";
  position: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "DISABLED";
  contactNumber: string | null;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    avatarUrl: user.avatarUrl,
    status: user.status,
    contactNumber: user.contactNumber,
    mustChangePassword: user.mustChangePassword,
    lastLogin: user.lastLoginAt,
  };
}

async function login(params: { email: string; password: string; rememberMe: boolean; req: Request }) {
  const { email, password, rememberMe, req } = params;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    await activityLogService.log({
      req,
      action: "Failed login attempt",
      module: "AUTHENTICATION",
      description: `No account found for ${email}`,
      status: "FAILED",
    });
    throw ApiError.unauthorized("No staff account found with that email address.");
  }

  if (user.status === "DISABLED") {
    throw ApiError.forbidden("This account has been disabled. Please contact your administrator.");
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    await activityLogService.log({
      req,
      action: "Failed login attempt",
      module: "AUTHENTICATION",
      description: "Incorrect password",
      status: "FAILED",
    });
    throw ApiError.unauthorized("Incorrect password. Please try again.");
  }

  const tokens = await tokenService.issueTokensForNewSession({
    userId: user.id,
    role: user.role,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    rememberMe,
  });

  await userRepository.updateLastLogin(user.id);

  // req.user isn't set yet at this point in the request lifecycle (this IS
  // the login call) so activityLogService.log would fall back to "System" —
  // write this one entry directly with the now-known identity instead.
  await activityLogRepository.create({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "Logged in",
    module: "AUTHENTICATION",
    ipAddress: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? req.socket.remoteAddress,
    browser: req.headers["user-agent"],
    status: "SUCCESS",
  });

  return { user: toPublicUser(user), tokens };
}

async function logout(params: { sessionId: string; req: Request }) {
  const { sessionId, req } = params;
  await sessionRepository.revoke(sessionId);
  await refreshTokenRepository.revokeAllForSession(sessionId);
  await activityLogService.log({ req, action: "Logged out", module: "AUTHENTICATION" });
}

async function logoutAll(params: { userId: string; req: Request }) {
  const { userId, req } = params;
  await sessionRepository.revokeAllForUser(userId);
  await activityLogService.log({ req, action: "Logged out of all devices", module: "AUTHENTICATION" });
}

async function changePassword(params: { userId: string; currentPassword: string; newPassword: string; req: Request }) {
  const { userId, currentPassword, newPassword, req } = params;

  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.unauthorized();
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash);
  await activityLogService.log({ req, action: "Changed own password", module: "AUTHENTICATION" });
}

export const authService = { login, logout, logoutAll, changePassword, toPublicUser };
