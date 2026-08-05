export type Purok =
  | "Purok 1 - Poblacion"
  | "Purok 2 - Riverside"
  | "Purok 3 - Mabuhay"
  | "Purok 4 - San Isidro"
  | "Purok 5 - Maligaya"
  | "Purok 6 - Bagong Silang"

export interface Address {
  purok: Purok
  street: string
  houseNumber: string
}

export interface UploadedFile {
  id: string
  name: string
  url: string
  sizeKb: number
  mimeType: string
  uploadedAt: string
}

export interface TimelineEvent {
  id: string
  label: string
  description?: string
  actor?: string
  timestamp: string
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SortDirection = "asc" | "desc"
