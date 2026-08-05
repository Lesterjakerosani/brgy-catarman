import type { CertificateRequest } from "@/types"

export function getCertificateTitle(request: CertificateRequest): string {
  if (request.documentType === "Other Barangay Document") {
    return request.otherDocumentLabel ?? "Barangay Document"
  }
  return request.documentType
}

export function getCertificateBody(request: CertificateRequest): string {
  const name = request.requestorName.toUpperCase()
  const address = request.address.replace(/,?\s*Barangay Catarman$/i, "")

  switch (request.documentType) {
    case "Barangay Certificate":
      return `This is to certify that ${name}, of legal age, is a bona fide resident of ${address}, Barangay Catarman. This certification is issued upon the request of the above-named person for whatever legal purpose it may serve, particularly for ${request.purpose}.`
    case "Barangay Clearance":
      return `This is to certify that ${name}, a resident of ${address}, Barangay Catarman, has no derogatory record on file with this office as of this date, and is known to be a person of good moral character within this community. This clearance is issued upon request for ${request.purpose}.`
    case "Certificate of Residency":
      return `This is to certify that ${name} is a bona fide resident of ${address}, Barangay Catarman, and has been residing at the said address. This certification is issued upon request of the above-named person for ${request.purpose}.`
    case "Certificate of Indigency":
      return `This is to certify that ${name}, a resident of ${address}, Barangay Catarman, belongs to an indigent family in this barangay based on the records of this office. This certification is issued upon request for ${request.purpose}.`
    case "Business Clearance":
      return `This is to certify that the business operated by ${name}, located at ${address}, Barangay Catarman, has been granted clearance to operate within this barangay, subject to compliance with existing barangay ordinances and regulations. This clearance is issued for ${request.purpose}.`
    default:
      return `This is to certify that ${name}, a resident of ${address}, Barangay Catarman, is known to this office. This document is issued upon request for ${request.purpose}.`
  }
}
