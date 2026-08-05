import type { CertificateRequest } from "@/types"
import certificateRequestsJson from "./generated/certificate-requests.json"

export const certificateRequests: CertificateRequest[] = certificateRequestsJson as CertificateRequest[]

export const DOCUMENT_TYPES = [
  "Barangay Certificate",
  "Barangay Clearance",
  "Certificate of Residency",
  "Certificate of Indigency",
  "Business Clearance",
  "Other Barangay Document",
] as const
