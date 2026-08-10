"use client"

import { Loader2, ShieldCheck } from "lucide-react"
import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface RecaptchaCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function RecaptchaCheckbox({ checked, onChange, className }: RecaptchaCheckboxProps) {
  const [verifying, setVerifying] = React.useState(false)

  function handleCheckedChange(value: boolean) {
    if (value) {
      setVerifying(true)
      window.setTimeout(() => {
        setVerifying(false)
        onChange(true)
      }, 700)
    } else {
      onChange(false)
    }
  }

  return (
    <div className={cn("flex w-full max-w-[300px] items-center gap-3 rounded-md border border-border bg-secondary/40 p-4", className)}>
      {verifying ? (
        <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <Checkbox checked={checked} onCheckedChange={(v) => handleCheckedChange(v === true)} className="size-5" />
      )}
      <div className="flex-1 text-sm text-foreground">{verifying ? "Verifying..." : "I'm not a robot"}</div>
      <ShieldCheck className={cn("size-6 shrink-0", checked ? "text-emerald-600" : "text-muted-foreground/40")} />
    </div>
  )
}
