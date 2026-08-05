import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { complaints as seedComplaints } from "@/data/complaints"
import type { Complaint, ComplaintFormValues, ComplaintStatus } from "@/types"
import { generateId, generateIncidentReference } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"

interface SubmitComplaintInput extends ComplaintFormValues {
  reporterPhotoUrl: string
  evidenceUrls: string[]
}

interface ComplaintsState {
  complaints: Complaint[]
  submitComplaint: (values: SubmitComplaintInput) => Complaint
  updateStatus: (id: string, status: ComplaintStatus, actor: string, staffNotes?: string) => void
  findByReference: (referenceNumber: string) => Complaint | undefined
}

export const useComplaintsStore = create<ComplaintsState>()(
  persist(
    (set, get) => ({
      complaints: seedComplaints,
      submitComplaint: (values) => {
        const now = new Date()
        const sequence = get().complaints.length + 1
        const complaint: Complaint = {
          id: generateId("cmp"),
          referenceNumber: generateIncidentReference(sequence, now),
          category: values.category,
          otherCategoryLabel: values.otherCategoryLabel,
          reporterName: values.reporterName,
          reporterPhone: values.reporterPhone,
          reporterEmail: values.reporterEmail,
          reportedPerson: values.reportedPerson,
          location: values.location,
          latitude: values.latitude,
          longitude: values.longitude,
          incidentDate: values.incidentDate,
          incidentTime: values.incidentTime,
          description: values.description,
          reporterPhotoUrl: values.reporterPhotoUrl,
          evidenceUrls: values.evidenceUrls,
          status: "New",
          isConfidential: true,
          submittedAt: now.toISOString(),
          timeline: [{ id: generateId("tl"), label: "Incident Reported", actor: values.reporterName, timestamp: now.toISOString() }],
        }
        set((state) => ({ complaints: [complaint, ...state.complaints] }))
        useLogsStore.getState().addNotification({
          title: "Incident Report Filed",
          message: `A new ${values.category} incident report (${complaint.referenceNumber}) was submitted.`,
          type: "warning",
          link: "/staff/complaints",
        })
        return complaint
      },
      updateStatus: (id, status, actor, staffNotes) => {
        set((state) => ({
          complaints: state.complaints.map((c) => {
            if (c.id !== id) return c
            const now = new Date().toISOString()
            return {
              ...c,
              status,
              staffNotes: staffNotes ?? c.staffNotes,
              resolvedAt: status === "Resolved" ? now : c.resolvedAt,
              timeline: [...c.timeline, { id: generateId("tl"), label: status, actor, timestamp: now }],
            }
          }),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: `${status} complaint`,
          module: "Complaints",
          description: `${actor} set complaint ${id} status to "${status}".`,
        })
      },
      findByReference: (referenceNumber) =>
        get().complaints.find((c) => c.referenceNumber.toLowerCase() === referenceNumber.trim().toLowerCase()),
    }),
    { name: "catarman-complaints-store", storage: idbJSONStorage }
  )
)
