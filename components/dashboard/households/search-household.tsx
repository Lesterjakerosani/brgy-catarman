"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchHouseholdProps {
  value: string
  onChange: (value: string) => void
}

export function SearchHousehold({ value, onChange }: SearchHouseholdProps) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by household number, head of household, or contact number..."
        className="h-10 rounded-[12px] border-[#E2E8F0] pl-10 pr-9 text-sm shadow-none transition-colors focus-visible:border-[#1E40AF] focus-visible:ring-[#1E40AF]/20"
      />
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-[10px] text-[#64748B] hover:bg-[#F1F5F9]"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
