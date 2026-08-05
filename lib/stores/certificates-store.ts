import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { certificateRequests as seedRequests } from "@/data/certificates"
import { systemSettings } from "@/data/settings"
import type { CertificateRequest, CertificateRequestFormValues, CertificateStatus, UploadedFile } from "@/types"
import { generateId, generateCertificateReference, generateControlNumber } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface SubmitPublicRequestInput extends CertificateRequestFormValues {
  requirements: UploadedFile[]
}

interface CertificatesState {
  certificateRequests: CertificateRequest[]
  submitPublicRequest: (values: SubmitPublicRequestInput) => CertificateRequest
  submitWalkInRequest: (
    values: CertificateRequestFormValues & {
      requirements: UploadedFile[]
      residentId?: string
      residentPhotoUrl?: string
      authorizationLetter?: UploadedFile
      representativeIdUrl?: string
    },
    actor: string
  ) => CertificateRequest
  updateStatus: (id: string, status: CertificateStatus, actor: string, extra?: { rejectionReason?: string; staffNotes?: string; extendDays?: number }) => void
  findByReference: (referenceNumber: string) => CertificateRequest | undefined
}

function nextSequence(requests: CertificateRequest[]) {
  return requests.length + 1
}

function pushTimeline(request: CertificateRequest, label: string, actor: string): CertificateRequest["timeline"] {
  return [...request.timeline, { id: generateId("tl"), label, actor, timestamp: new Date().toISOString() }]
}

export const useCertificatesStore = create<CertificatesState>()(
  persist(
    (set, get) => ({
      certificateRequests: seedRequests,
      submitPublicRequest: (values) => {
        const now = new Date()
        const sequence = nextSequence(get().certificateRequests)
        const request: CertificateRequest = {
          id: generateId("cert"),
          referenceNumber: generateCertificateReference(sequence, now),
          documentType: values.documentType,
          otherDocumentLabel: values.otherDocumentLabel,
          requestorName: values.requestorName,
          address: values.address,
          contactNumber: values.contactNumber,
          email: values.email,
          purpose: values.purpose,
          requirements: values.requirements,
          channel: "Online",
          status: "Pending",
          submittedAt: now.toISOString(),
          timeline: [{ id: generateId("tl"), label: "Request Submitted", actor: values.requestorName, timestamp: now.toISOString() }],
        }
        set((state) => ({ certificateRequests: [request, ...state.certificateRequests] }))
        useLogsStore.getState().addNotification({
          title: "New Certificate Request",
          message: `${values.requestorName} submitted a ${values.documentType} request (${request.referenceNumber}).`,
          type: "info",
          link: "/staff/certificates",
        })
        return request
      },
      submitWalkInRequest: (values, actor) => {
        const now = new Date()
        const sequence = nextSequence(get().certificateRequests)
        const request: CertificateRequest = {
          id: generateId("cert"),
          referenceNumber: generateCertificateReference(sequence, now),
          documentType: values.documentType,
          otherDocumentLabel: values.otherDocumentLabel,
          requestorName: values.requestorName,
          address: values.address,
          contactNumber: values.contactNumber,
          email: values.email,
          purpose: values.purpose,
          requirements: values.requirements,
          residentId: values.residentId,
          residentPhotoUrl: values.residentPhotoUrl,
          authorizationLetter: values.authorizationLetter,
          representativeIdUrl: values.representativeIdUrl,
          channel: "Walk-in",
          status: "Under Review",
          processedBy: actor,
          submittedAt: now.toISOString(),
          timeline: [
            { id: generateId("tl"), label: "Walk-in Request Encoded", actor, timestamp: now.toISOString() },
            { id: generateId("tl2"), label: "Under Review", actor, timestamp: now.toISOString() },
          ],
        }
        set((state) => ({ certificateRequests: [request, ...state.certificateRequests] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Encoded walk-in certificate request",
          module: "Certificates",
          description: `${actor} encoded a walk-in ${values.documentType} request for ${values.requestorName}.`,
        })
        return request
      },
      updateStatus: (id, status, actor, extra) => {
        set((state) => ({
          certificateRequests: state.certificateRequests.map((req) => {
            if (req.id !== id) return req
            const now = new Date().toISOString()
            const updated: CertificateRequest = { ...req, status, timeline: pushTimeline(req, status, actor), processedBy: actor }

            if (status === "Under Review") {
              updated.reviewedAt = now
            }
            if (status === "Approved") {
              const sequence = state.certificateRequests.filter((r) => r.controlNumber).length + 1
              updated.approvedAt = now
              updated.controlNumber = updated.controlNumber ?? generateControlNumber(sequence)
              const deadline = new Date()
              deadline.setDate(deadline.getDate() + systemSettings.claimDeadlineDays)
              updated.claimDeadline = deadline.toISOString()
            }
            if (status === "Ready for Claim" && !updated.claimDeadline) {
              const deadline = new Date()
              deadline.setDate(deadline.getDate() + systemSettings.claimDeadlineDays)
              updated.claimDeadline = deadline.toISOString()
            }
            if (status === "Claimed") {
              updated.claimedAt = now
            }
            if (status === "Rejected") {
              updated.rejectionReason = extra?.rejectionReason ?? updated.rejectionReason
            }
            if (extra?.staffNotes) {
              updated.staffNotes = extra.staffNotes
            }
            if (extra?.extendDays) {
              const base = updated.claimDeadline ? new Date(updated.claimDeadline) : new Date()
              base.setDate(base.getDate() + extra.extendDays)
              updated.claimDeadline = base.toISOString()
              updated.timeline = [...updated.timeline, { id: generateId("tl"), label: `Claim deadline extended by ${extra.extendDays} day(s)`, actor, timestamp: now }]
            }
            return updated
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: `${status} certificate request`,
          module: "Certificates",
          description: `${actor} set request ${id} status to "${status}".`,
        })
      },
      findByReference: (referenceNumber) =>
        get().certificateRequests.find((r) => r.referenceNumber.toLowerCase() === referenceNumber.trim().toLowerCase()),
    }),
    { name: "catarman-certificates-store", storage: idbJSONStorage }
  )
)
