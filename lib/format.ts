import { format, formatDistanceToNow, isToday, isValid, isYesterday } from "date-fns"

export function formatDate(value?: string | Date, pattern = "MMM d, yyyy"): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  return format(date, pattern)
}

export function formatDateTime(value?: string | Date): string {
  return formatDate(value, "MMM d, yyyy 'at' h:mm a")
}

export function formatRelativeTime(value?: string | Date): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatUpdatedLabel(value?: string | Date): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (!isValid(date)) return "—"
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatPhone(value?: string): string {
  return value && value.length > 0 ? value : "—"
}
