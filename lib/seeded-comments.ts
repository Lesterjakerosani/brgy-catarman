export const COMMENT_TEMPLATES = [
  "Thank you for the update, Barangay!",
  "Noted, will attend. More power to our officials!",
  "Is this open to non-residents as well?",
  "Can we get a text reminder before the day?",
  "Salamat po sa impormasyon!",
  "What time should we arrive?",
  "Hoping this pushes through as scheduled.",
  "Please post the requirements too, thank you.",
  "God bless our Barangay Catarman!",
  "Is there a deadline for this?",
  "Finally, this is very helpful po.",
  "Will there be a follow-up announcement?",
]

export function seededInt(seed: string, min: number, max: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return min + (hash % (max - min + 1))
}

export interface SeededComment {
  name: string
  text: string
  timeLabel: string
}

export function buildSeededComments(id: string, count: number): SeededComment[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = `${id}-${i}`
    const text = COMMENT_TEMPLATES[seededInt(seed + "t", 0, COMMENT_TEMPLATES.length - 1)]
    const hoursAgo = seededInt(seed + "h", 1, 96)
    const timeLabel = hoursAgo < 24 ? `${hoursAgo}h` : `${Math.floor(hoursAgo / 24)}d`
    return { name: "Resident", text, timeLabel }
  })
}
