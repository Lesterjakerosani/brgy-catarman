"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, ChevronDown, ClipboardCheck, Copy, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { RecaptchaCheckbox } from "@/components/shared/recaptcha-checkbox"
import { ResidentPickerField, type ResidentPickerValue } from "@/components/shared/resident-picker-field"
import { DOCUMENT_TYPES } from "@/data/certificates"
import { useSubmitPublicCertificateRequest } from "@/lib/api/hooks/use-certificate-requests"
import { usePublicDocumentTypes } from "@/lib/api/hooks/use-document-types"
import { ApiError } from "@/lib/api/types"
import { usePublicDialogStore } from "@/lib/stores/public-dialog-store"
import type { DocumentType, UploadedFile } from "@/types"

const requestSchema = z
  .object({
    documentTypes: z.array(z.enum(DOCUMENT_TYPES)).min(1, "Please select at least one document."),
    otherDocumentLabel: z.string().optional(),
    address: z.string().min(5, "Please enter your complete address."),
    contactNumber: z.string().min(7, "Please enter a valid contact number."),
    email: z.email("Please enter a valid email address."),
    purpose: z.string().min(5, "Please describe the purpose of your request."),
  })
  .superRefine((data, ctx) => {
    if (data.documentTypes.includes("Other Barangay Document") && !data.otherDocumentLabel?.trim()) {
      ctx.addIssue({ code: "custom", path: ["otherDocumentLabel"], message: "Please specify the document you need." })
    }
  })

type RequestValues = z.infer<typeof requestSchema>

export function RequestDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const submitPublicRequest = useSubmitPublicCertificateRequest()
  const { documentTypes } = usePublicDocumentTypes()
  const setOpenDialog = usePublicDialogStore((s) => s.setOpenDialog)
  const [validId, setValidId] = React.useState<UploadedFile[]>([])
  const [purokCert, setPurokCert] = React.useState<UploadedFile[]>([])
  const [sanitaryCard, setSanitaryCard] = React.useState<UploadedFile[]>([])
  const [otherDocs, setOtherDocs] = React.useState<UploadedFile[]>([])
  const [verified, setVerified] = React.useState(false)
  const [selectedResident, setSelectedResident] = React.useState<ResidentPickerValue | null>(null)
  const [requirementsError, setRequirementsError] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<"form" | "success">("form")
  const [referenceNumber, setReferenceNumber] = React.useState("")
  const [submittedDocumentTypes, setSubmittedDocumentTypes] = React.useState<DocumentType[]>([])

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      documentTypes: ["Barangay Certificate"],
      otherDocumentLabel: "",
      address: "",
      contactNumber: "",
      email: "",
      purpose: "",
    },
  })

  const selectedDocumentTypes = form.watch("documentTypes")
  const includesOther = selectedDocumentTypes.includes("Other Barangay Document")

  React.useEffect(() => {
    if (open) {
      setPhase("form")
      form.reset()
      setValidId([])
      setPurokCert([])
      setSanitaryCard([])
      setOtherDocs([])
      setVerified(false)
      setSelectedResident(null)
      setRequirementsError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(values: RequestValues) {
    if (!selectedResident) {
      setRequirementsError("Please select your name from the resident list. Only names on record in our household/resident database can submit a request.")
      return
    }
    if (validId.length === 0) {
      setRequirementsError("Please upload a valid ID to proceed with your request.")
      return
    }
    if (!verified) {
      setRequirementsError("Please complete the verification checkbox before submitting.")
      return
    }
    setRequirementsError(null)

    const requirements = [...validId, ...purokCert, ...sanitaryCard, ...otherDocs]
    try {
      const batch = await submitPublicRequest.mutateAsync({
        values: { ...values, residentId: selectedResident.id },
        requirements,
        documentTypes,
      })
      setReferenceNumber(batch.referenceNumber)
      setSubmittedDocumentTypes(values.documentTypes)
      setPhase("success")
    } catch (err) {
      setRequirementsError(err instanceof ApiError ? err.message : "Unable to submit your request. Please try again.")
    }
  }

  function copyReference() {
    navigator.clipboard.writeText(referenceNumber)
    toast.success("Reference number copied to clipboard.")
  }

  function trackThisRequest() {
    onOpenChange(false)
    setOpenDialog("track-request", referenceNumber)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        {phase === "success" ? (
          <>
            <DialogHeader>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Check className="size-7" />
              </div>
              <DialogTitle className="text-center">Request Submitted Successfully</DialogTitle>
              <DialogDescription className="text-center">
                Please save your reference number. You will need it to track {submittedDocumentTypes.length > 1 ? "all of these requests" : "your request status"}.
              </DialogDescription>
            </DialogHeader>

            {submittedDocumentTypes.length > 1 ? (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents Requested</p>
                <ul className="space-y-1 text-sm text-foreground">
                  {submittedDocumentTypes.map((type) => (
                    <li key={type} className="flex items-center gap-2">
                      <Check className="size-3.5 shrink-0 text-emerald-600" />
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <span className="font-heading text-lg font-bold tracking-wide text-primary">{referenceNumber}</span>
              <Button type="button" variant="outline" size="sm" onClick={copyReference}>
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>

            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0" />
              A confirmation email with your request details and claim instructions has been sent to your email address.
            </p>

            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={trackThisRequest}>Track This Request</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a Barangay Document</DialogTitle>
              <DialogDescription>
                Fill out the form below to request a certificate or clearance. You will receive a reference number to track your request — no account needed.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-1">
                  <h2 className="font-heading text-base font-bold text-foreground">1. Document Details</h2>
                  <p className="text-sm text-muted-foreground">Select the document you need and your purpose for requesting it.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="documentTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type(s)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button type="button" variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate text-left">
                                  {field.value.length === 0
                                    ? "Select document type(s)"
                                    : field.value.length === 1
                                      ? field.value[0]
                                      : `${field.value.length} documents selected`}
                                </span>
                                <ChevronDown className="size-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-[var(--radix-popper-anchor-width)] min-w-72 p-1">
                            {DOCUMENT_TYPES.map((type) => {
                              const checked = field.value.includes(type)
                              return (
                                <label
                                  key={type}
                                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) => {
                                      const value: DocumentType[] = next
                                        ? [...field.value, type]
                                        : field.value.filter((v) => v !== type)
                                      field.onChange(value)
                                    }}
                                  />
                                  {type}
                                </label>
                              )
                            })}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Employment requirement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {includesOther ? (
                  <FormField
                    control={form.control}
                    name="otherDocumentLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Document</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Certificate of Good Moral Character" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="space-y-1 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">2. Resident Information</h2>
                  <p className="text-sm text-muted-foreground">Please provide your complete and accurate information.</p>
                </div>

                <div className="space-y-2">
                  <FormLabel>Full Name</FormLabel>
                  <ResidentPickerField value={selectedResident} onChange={setSelectedResident} />
                  <p className="text-sm text-muted-foreground">
                    Search and select your name as registered in our household/resident records. Only registered residents can submit a request.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0917 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complete Address</FormLabel>
                      <FormControl>
                        <Input placeholder="House No., Street, Purok, Barangay Catarman" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormDescription>Your reference number and status updates will be sent to this email.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-1 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">3. Requirements</h2>
                  <p className="text-sm text-muted-foreground">Upload clear photos or scans of your requirements.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FileDropzone label="Valid ID (required)" hint="Government-issued ID, JPG/PNG/PDF up to 5MB" value={validId} onChange={setValidId} multiple={false} />
                  <FileDropzone label="Purok Certification" hint="Optional, JPG/PNG/PDF up to 5MB" value={purokCert} onChange={setPurokCert} multiple={false} />
                  <FileDropzone label="Sanitary Card" hint="Optional, JPG/PNG/PDF up to 5MB" value={sanitaryCard} onChange={setSanitaryCard} multiple={false} />
                  <FileDropzone label="Other Supporting Documents" hint="Optional, multiple files allowed" value={otherDocs} onChange={setOtherDocs} />
                </div>

                <div className="flex flex-col items-start gap-3 border-t border-border pt-6">
                  <h2 className="font-heading text-base font-bold text-foreground">4. Verification</h2>
                  <RecaptchaCheckbox checked={verified} onChange={setVerified} />
                </div>

                {requirementsError ? <p className="text-sm font-medium text-destructive">{requirementsError}</p> : null}

                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  <ClipboardCheck className="size-4" />
                  Submit Request
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
