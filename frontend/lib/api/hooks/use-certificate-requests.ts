import { useQuery, useQueryClient } from "@tanstack/react-query"
import { certificateRequestsApi } from "@/lib/api/endpoints"
import { qk } from "@/lib/api/query-keys"
import { useApiMutation } from "@/lib/api/mutation-helpers"
import {
  toPublicRequestPayload,
  toWalkInRequestPayload,
  fromCertificateRequestDto,
  certificateStatusToBackend,
} from "@/lib/api/adapters/certificateRequest.adapter"
import { dataUrlToFile } from "@/lib/api/adapters/file.adapter"
import type { BackendDocumentType } from "@/lib/api/hooks/use-document-types"
import type { PaginatedResult } from "@/lib/api/types"
import type { CertificateRequest, CertificateStatus, DocumentType, UploadedFile } from "@/types"

export function useCertificateRequests(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  const queryParams = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20, search: params?.search, status: params?.status }
  const { data, isLoading } = useQuery<PaginatedResult<unknown>>({
    queryKey: qk.certificateRequests.list(queryParams),
    queryFn: () => certificateRequestsApi.list(queryParams),
  })
  return {
    certificateRequests: (data?.items ?? []).map((r) => fromCertificateRequestDto(r as never)),
    total: data?.total ?? 0,
    isLoading,
  }
}

/** Fetches every request in one page — dashboard pages that still cross-reference
 * (e.g. the certificate template builder looking up a request by id) filter
 * client-side. Fine at this barangay's realistic data volume. */
export function useAllCertificateRequests() {
  return useCertificateRequests({ pageSize: 5000 })
}

export function useSubmitPublicCertificateRequest() {
  return useApiMutation<
    CertificateRequest,
    {
      values: {
        documentType: DocumentType
        otherDocumentLabel?: string
        requestorName: string
        address: string
        contactNumber: string
        email: string
        purpose: string
      }
      requirements: UploadedFile[]
      documentTypes: BackendDocumentType[]
    }
  >({
    mutationFn: async ({ values, requirements, documentTypes }) => {
      const created = fromCertificateRequestDto((await certificateRequestsApi.submitPublic(toPublicRequestPayload(values, documentTypes))) as never)
      for (const file of requirements) {
        await certificateRequestsApi.uploadRequirementPublic(created.id, dataUrlToFile(file.url, file.name), file.name)
      }
      return created
    },
    showErrorToast: false,
  })
}

export function useSubmitWalkInCertificateRequest() {
  const queryClient = useQueryClient()
  return useApiMutation<
    CertificateRequest,
    {
      values: {
        documentType: DocumentType
        otherDocumentLabel?: string
        requestorName: string
        address: string
        contactNumber: string
        email: string
        purpose: string
        residentId?: string
      }
      requirements: UploadedFile[]
      residentPhotoDataUrl: string
      authorizationLetter?: UploadedFile
      representativeId?: UploadedFile
      documentTypes: BackendDocumentType[]
    }
  >({
    mutationFn: async ({ values, requirements, residentPhotoDataUrl, authorizationLetter, representativeId, documentTypes }) => {
      const created = (await certificateRequestsApi.submitWalkIn(toWalkInRequestPayload(values, documentTypes))) as never
      let request = fromCertificateRequestDto(created)

      const attachments: { file: UploadedFile }[] = requirements.map((f) => ({ file: f }))
      attachments.push({ file: { id: "photo", name: "Resident Photo (Live Capture)", url: residentPhotoDataUrl, sizeKb: 0, mimeType: "image/jpeg", uploadedAt: "" } })
      if (authorizationLetter) attachments.push({ file: { ...authorizationLetter, name: `Authorization Letter — ${authorizationLetter.name}` } })
      if (representativeId) attachments.push({ file: { ...representativeId, name: `Representative's Valid ID — ${representativeId.name}` } })

      for (const { file } of attachments) {
        const realFile = dataUrlToFile(file.url, file.name)
        await certificateRequestsApi.uploadRequirement(request.id, realFile, file.name)
      }

      const approved = (await certificateRequestsApi.updateStatus(request.id, {
        status: certificateStatusToBackend.Approved,
        staffNotes: "Walk-in request encoded and approved on the same day.",
      })) as never
      request = fromCertificateRequestDto(approved)
      return request
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.certificateRequests.all }),
    successMessage: "Certificate generated. Opening print preview...",
  })
}

export function useUpdateCertificateStatus() {
  const queryClient = useQueryClient()
  return useApiMutation<
    CertificateRequest,
    { id: string; status: CertificateStatus; extra?: { rejectionReason?: string; staffNotes?: string; extendDays?: number } }
  >({
    mutationFn: async ({ id, status, extra }) =>
      fromCertificateRequestDto(
        (await certificateRequestsApi.updateStatus(id, { status: certificateStatusToBackend[status], ...extra })) as never,
      ),
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: qk.certificateRequests.all })
      queryClient.setQueryData(qk.certificateRequests.detail(request.id), request)
    },
    successMessage: "Request status updated.",
  })
}

export function useDeleteCertificateRequest() {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => certificateRequestsApi.delete(id),
    invalidates: [qk.certificateRequests.all],
    successMessage: "Certificate request deleted.",
  })
}

export function useTrackCertificateRequest(referenceNumber: string | undefined) {
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: qk.certificateRequests.track(referenceNumber ?? ""),
    queryFn: () => certificateRequestsApi.track(referenceNumber!),
    enabled: Boolean(referenceNumber),
    retry: false,
  })
  return { request: data ? fromCertificateRequestDto(data as never) : undefined, isLoading, isError }
}
