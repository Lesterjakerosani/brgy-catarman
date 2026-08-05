let counter = 0

export function generateId(prefix: string): string {
  counter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}${counter}${random}`
}

function pad(value: number, length = 5): string {
  return String(value).padStart(length, "0")
}

export function generateCertificateReference(sequence: number, date: Date = new Date()): string {
  return `BC-${date.getFullYear()}-${pad(sequence)}`
}

export function generateControlNumber(sequence: number, date: Date = new Date()): string {
  return `CTC-${date.getFullYear()}-${pad(sequence)}`
}

export function generateIncidentReference(sequence: number, date: Date = new Date()): string {
  return `INC-${date.getFullYear()}-${pad(sequence)}`
}

export function generateCaseNumber(sequence: number, date: Date = new Date()): string {
  return `BLT-${date.getFullYear()}-${pad(sequence, 4)}`
}

export function generateHouseholdNumber(sitioCode: string, purokNumber: string, sequence: number): string {
  return `HH-${sitioCode}-P${purokNumber}-${pad(sequence, 3)}`
}
