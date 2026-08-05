import type { UploadedFile, TimelineEvent } from "./common"

export type DocumentType =
  | "Barangay Certificate"
  | "Barangay Clearance"
  | "Certificate of Residency"
  | "Certificate of Indigency"
  | "Business Clearance"
  | "Other Barangay Document"

export type CertificateStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Ready for Claim"
  | "Claimed"
  | "Not Claimed"
  | "Expired"

export type RequestChannel = "Online" | "Walk-in"

export interface CertificateRequest {
  id: string
  referenceNumber: string
  controlNumber?: string
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
  requirements: UploadedFile[]
  residentId?: string
  residentPhotoUrl?: string
  channel: RequestChannel
  status: CertificateStatus
  staffNotes?: string
  rejectionReason?: string
  processedBy?: string
  submittedAt: string
  reviewedAt?: string
  approvedAt?: string
  claimDeadline?: string
  claimedAt?: string
  timeline: TimelineEvent[]
  authorizationLetter?: UploadedFile
  representativeIdUrl?: string
}

export interface CertificateRequestFormValues {
  documentType: DocumentType
  otherDocumentLabel?: string
  requestorName: string
  address: string
  contactNumber: string
  email: string
  purpose: string
}
