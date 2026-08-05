import { create } from "zustand"
import { persist } from "zustand/middleware"
import { idbJSONStorage } from "@/lib/idb-storage"
import { getDefaultTemplateBodyHtml } from "@/data/certificate-template-defaults"
import { generateId } from "@/lib/ids"
import { useLogsStore } from "@/lib/stores/logs-store"
import type { CertificateTemplate, CertificateTemplateFormValues, CertificateTemplateType } from "@/types"

const SEED_TYPES: CertificateTemplateType[] = [
  "Certificate of Residency",
  "Certificate of Indigency",
  "Barangay Clearance",
  "Business Clearance",
  "Certificate of Good Moral Character",
  "Senior Citizen Certificate",
  "Solo Parent Certificate",
]

function buildSeedTemplates(): CertificateTemplate[] {
  const now = new Date().toISOString()
  return SEED_TYPES.map((type, index) => ({
    id: generateId("ctpl"),
    name: `${type} Template`,
    type,
    status: "Active",
    requireResidentPhoto: true,
    showBarangayLogo: true,
    showBarangayDrySeal: true,
    bodyHtml: getDefaultTemplateBodyHtml(type),
    createdAt: now,
    updatedAt: new Date(Date.now() - index * 1000).toISOString(),
  }))
}

interface CertificateTemplatesState {
  templates: CertificateTemplate[]
  addTemplate: (values: CertificateTemplateFormValues, actor: string) => CertificateTemplate
  updateTemplate: (id: string, values: CertificateTemplateFormValues, actor: string) => void
  deleteTemplate: (id: string, actor: string) => void
}

export const useCertificateTemplatesStore = create<CertificateTemplatesState>()(
  persist(
    (set) => ({
      templates: buildSeedTemplates(),
      addTemplate: (values, actor) => {
        const now = new Date().toISOString()
        const template: CertificateTemplate = { id: generateId("ctpl"), ...values, createdAt: now, updatedAt: now }
        set((state) => ({ templates: [template, ...state.templates] }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Created certificate template",
          module: "Certificates",
          description: `${actor} created certificate template "${template.name}".`,
        })
        return template
      },
      updateTemplate: (id, values, actor) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...values, updatedAt: new Date().toISOString() } : t)),
        }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Updated certificate template",
          module: "Certificates",
          description: `${actor} updated certificate template "${values.name}".`,
        })
      },
      deleteTemplate: (id, actor) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }))
        useLogsStore.getState().addLog({
          actorName: actor,
          actorRole: "Staff",
          action: "Deleted certificate template",
          module: "Certificates",
          description: `${actor} deleted certificate template ${id}.`,
        })
      },
    }),
    { name: "catarman-certificate-templates-store", storage: idbJSONStorage }
  )
)
