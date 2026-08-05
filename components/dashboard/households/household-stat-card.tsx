import type { LucideIcon } from "lucide-react"

interface HouseholdStatCardProps {
  label: string
  value: number | string
  description: string
  icon: LucideIcon
}

export function HouseholdStatCard({ label, value, description, icon: Icon }: HouseholdStatCardProps) {
  return (
    <div className="relative rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
      <Icon className="absolute right-6 top-6 size-5 text-[#64748B]" />
      <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#0F172A]">{label}</p>
      <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
    </div>
  )
}
