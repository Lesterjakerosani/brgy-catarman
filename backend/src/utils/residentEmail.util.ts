import { format } from "date-fns";
import { sendEmail } from "./mailer.util";

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function wrapper(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #0B2C5F; margin-bottom: 4px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        This is an automated message from the Barangay Catarman Online Services Portal. Please do not reply directly to this email.
      </p>
    </div>
  `;
}

export async function sendCertificateSubmittedEmail(params: {
  email: string;
  requestorName: string;
  referenceNumber: string;
  documentTypeName: string;
}) {
  const { email, requestorName, referenceNumber, documentTypeName } = params;
  await sendEmail(
    email,
    `Document Request Received — ${referenceNumber}`,
    wrapper(
      "Request Received",
      `
        <p>Hi ${requestorName},</p>
        <p>We've received your request for a <strong>${documentTypeName}</strong>. Please save your reference number below to track your request status.</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center;">${referenceNumber}</p>
        <p>We'll email you again whenever your request's status changes.</p>
      `,
    ),
  );
}

export async function sendCertificateStatusEmail(params: {
  email: string;
  requestorName: string;
  referenceNumber: string;
  documentTypeName: string;
  status: string;
  claimDeadline?: Date | null;
  rejectionReason?: string | null;
}) {
  const { email, requestorName, referenceNumber, documentTypeName, status, claimDeadline, rejectionReason } = params;
  const statusLabel = titleCase(status);

  let extra = "";
  if (status === "READY_FOR_CLAIM" && claimDeadline) {
    extra = `<p>Please claim your document at the barangay hall on or before <strong>${format(claimDeadline, "MMMM d, yyyy")}</strong>.</p>`;
  } else if (status === "REJECTED" && rejectionReason) {
    extra = `<p><strong>Reason:</strong> ${rejectionReason}</p>`;
  }

  await sendEmail(
    email,
    `Update on Your Document Request — ${referenceNumber}`,
    wrapper(
      "Request Status Updated",
      `
        <p>Hi ${requestorName},</p>
        <p>Your request for a <strong>${documentTypeName}</strong> (reference <strong>${referenceNumber}</strong>) is now:</p>
        <p style="font-size: 18px; font-weight: bold; color: #0B2C5F;">${statusLabel}</p>
        ${extra}
      `,
    ),
  );
}

export async function sendComplaintSubmittedEmail(params: {
  email: string;
  reporterName: string;
  referenceNumber: string;
}) {
  const { email, reporterName, referenceNumber } = params;
  await sendEmail(
    email,
    `Incident Report Received — ${referenceNumber}`,
    wrapper(
      "Report Received",
      `
        <p>Hi ${reporterName},</p>
        <p>We've received your incident report. Your identity remains confidential and is only visible to authorized barangay staff.</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center;">${referenceNumber}</p>
        <p>We'll email you again whenever your report's status changes.</p>
      `,
    ),
  );
}

export async function sendComplaintStatusEmail(params: {
  email: string;
  reporterName: string;
  referenceNumber: string;
  status: string;
}) {
  const { email, reporterName, referenceNumber, status } = params;
  const statusLabel = titleCase(status);

  await sendEmail(
    email,
    `Update on Your Incident Report — ${referenceNumber}`,
    wrapper(
      "Report Status Updated",
      `
        <p>Hi ${reporterName},</p>
        <p>Your incident report (reference <strong>${referenceNumber}</strong>) is now:</p>
        <p style="font-size: 18px; font-weight: bold; color: #0B2C5F;">${statusLabel}</p>
      `,
    ),
  );
}
