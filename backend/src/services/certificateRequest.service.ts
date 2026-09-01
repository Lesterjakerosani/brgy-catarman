import { Request } from "express";
import { addDays } from "date-fns";
import { certificateRequestRepository, CertificateRequestListFilters } from "../repositories/certificateRequest.repository";
import { prisma } from "../config/prisma";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";
import { notificationRepository } from "../repositories/notification.repository";
import { sendCertificateStatusEmail, sendCertificateSubmittedEmail } from "../utils/residentEmail.util";

export interface PublicCertificateRequestInput {
  documentTypeId: string;
  otherDocumentLabel?: string;
  requestorName: string;
  address: string;
  contactNumber: string;
  email: string;
  purpose: string;
  residentId?: string;
}

export interface WalkInCertificateRequestInput extends PublicCertificateRequestInput {
  residentPhotoUrl?: string;
  authorizationLetterUrl?: string;
  representativeIdUrl?: string;
}

async function getClaimDeadlineDays(): Promise<number> {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
  return settings?.claimDeadlineDays ?? 30;
}

async function list(req: Request, filters: Omit<CertificateRequestListFilters, "skip" | "take">) {
  const pagination = parsePagination(req);
  const { items, total } = await certificateRequestRepository.list({ ...filters, ...pagination });
  return toPaginationResult(items, total, pagination);
}

async function getById(id: string) {
  const request = await certificateRequestRepository.findById(id);
  if (!request) {
    throw ApiError.notFound("Certificate request not found");
  }
  return request;
}

async function trackByReference(referenceNumber: string) {
  const request = await certificateRequestRepository.findByReferenceNumber(referenceNumber);
  if (!request) {
    throw ApiError.notFound("No request found with that reference number");
  }
  return request;
}

async function submitPublicRequest(input: PublicCertificateRequestInput, req: Request) {
  const resident = input.residentId
    ? await prisma.resident.findFirst({ where: { id: input.residentId, deletedAt: null } })
    : null;
  if (!resident) {
    throw ApiError.badRequest("We couldn't find that resident record. Please select your name from the list.");
  }
  const requestorName = [resident.firstName, resident.middleName, resident.lastName, resident.suffix]
    .filter(Boolean)
    .join(" ");

  const duplicate = await certificateRequestRepository.findActiveDuplicate(resident.id, input.documentTypeId);
  if (duplicate) {
    throw ApiError.conflict(
      `You already have a request for this document (Reference No. ${duplicate.referenceNumber}) that's still being processed. Please track that request instead of submitting a new one.`,
    );
  }

  const request = await certificateRequestRepository.create(
    { ...input, requestorName, channel: "ONLINE", status: "PENDING" },
    "Request submitted online",
  );

  await activityLogService.log({
    req,
    action: "New online certificate request submitted",
    module: "CERTIFICATES",
    description: request.referenceNumber,
  });

  await notificationRepository.create({
    title: "New Document Request",
    message: `${requestorName} requested a ${request.documentType.name} (Ref: ${request.referenceNumber})`,
    type: "INFO",
    link: "/dashboard/certificates",
  });

  await sendCertificateSubmittedEmail({
    email: request.email,
    requestorName: request.requestorName,
    referenceNumber: request.referenceNumber,
    documentTypeName: request.documentType.name,
  });

  return request;
}

async function submitWalkInRequest(input: WalkInCertificateRequestInput, req: Request) {
  const request = await certificateRequestRepository.create(
    {
      ...input,
      channel: "WALK_IN",
      status: "PROCESSING",
      processedById: req.user!.id,
      reviewedAt: new Date(),
    },
    "Walk-in request recorded",
  );

  await activityLogService.log({
    req,
    action: "New walk-in certificate request recorded",
    module: "CERTIFICATES",
    description: request.referenceNumber,
  });

  await sendCertificateSubmittedEmail({
    email: request.email,
    requestorName: request.requestorName,
    referenceNumber: request.referenceNumber,
    documentTypeName: request.documentType.name,
  });

  return request;
}

async function updateStatus(
  id: string,
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "READY_FOR_CLAIM" | "CLAIMED",
  req: Request,
  extra?: { rejectionReason?: string; staffNotes?: string; extendDays?: number; claimedBy?: string },
) {
  const existing = await certificateRequestRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Certificate request not found");
  }

  const data: Record<string, unknown> = { status, processedById: req.user!.id };
  let timelineLabel = `Status changed to ${status}`;
  // Only mint a control number the first time a request is approved — a
  // later re-approval (e.g. after being bounced back to review) must not
  // overwrite the original number a resident may already have been told.
  let generateControlNumber = false;

  if (extra?.staffNotes !== undefined) {
    data.staffNotes = extra.staffNotes;
  }

  switch (status) {
    case "PROCESSING":
      data.reviewedAt = new Date();
      timelineLabel = "Request is now being processed";
      break;
    case "APPROVED": {
      data.approvedAt = new Date();
      const claimDeadlineDays = await getClaimDeadlineDays();
      data.claimDeadline = addDays(new Date(), claimDeadlineDays);
      generateControlNumber = !existing.controlNumber;
      timelineLabel = "Request approved";
      break;
    }
    case "READY_FOR_CLAIM":
      if (!existing.claimDeadline) {
        const claimDeadlineDays = await getClaimDeadlineDays();
        data.claimDeadline = addDays(new Date(), claimDeadlineDays);
      }
      timelineLabel = "Document is ready for claim";
      break;
    case "CLAIMED":
      // Idempotency guard: only stamp claimedAt/feeAmount the FIRST time a
      // request transitions to Claimed. Re-saving an already-claimed request
      // must never re-record revenue or shift it into a different day/month/
      // year bucket -- and the fee is locked in at whatever the document
      // type's price is right now (at the moment of claiming), so a later
      // price change in Settings never retroactively affects it.
      if (!existing.claimedAt) {
        data.claimedAt = new Date();
        data.feeAmount = existing.documentType.fee;
      }
      if (extra?.claimedBy) {
        data.staffNotes = [existing.staffNotes, `Claimed by: ${extra.claimedBy}`].filter(Boolean).join(" | ");
      }
      timelineLabel = "Document claimed by requestor";
      break;
    case "REJECTED":
      data.rejectionReason = extra?.rejectionReason;
      timelineLabel = "Request rejected";
      break;
  }

  if (extra?.extendDays) {
    const base = existing.claimDeadline ?? new Date();
    data.claimDeadline = addDays(base, extra.extendDays);
    timelineLabel = `Claim deadline extended by ${extra.extendDays} day(s)`;
  }

  const request = await certificateRequestRepository.updateStatus(
    id,
    data,
    { label: timelineLabel, actor: req.user!.name },
    generateControlNumber,
  );

  await activityLogService.log({
    req,
    action: `Certificate request ${status.toLowerCase().replace(/_/g, " ")}`,
    module: "CERTIFICATES",
    description: request.referenceNumber,
  });

  await sendCertificateStatusEmail({
    email: request.email,
    requestorName: request.requestorName,
    referenceNumber: request.referenceNumber,
    documentTypeName: request.documentType.name,
    status: request.status,
    claimDeadline: request.claimDeadline,
    rejectionReason: request.rejectionReason,
  });

  return request;
}

async function addRequirement(
  id: string,
  file: { name: string; url: string; sizeKb: number; mimeType: string },
  req: Request,
) {
  await getById(id);
  const requirement = await certificateRequestRepository.addRequirement(id, file);
  await activityLogService.log({
    req,
    action: "Uploaded certificate requirement",
    module: "CERTIFICATES",
    description: file.name,
  });
  return requirement;
}

async function remove(id: string, req: Request) {
  const existing = await getById(id);
  await certificateRequestRepository.softDelete(id);
  await activityLogService.log({
    req,
    action: "Deleted certificate request",
    module: "CERTIFICATES",
    description: existing.referenceNumber,
  });
}

export const certificateRequestService = {
  list,
  getById,
  trackByReference,
  submitPublicRequest,
  submitWalkInRequest,
  updateStatus,
  addRequirement,
  remove,
};
