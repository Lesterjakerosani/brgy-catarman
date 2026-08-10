"use client"

import * as React from "react"
import { usePublicSettings } from "@/lib/api/hooks/use-settings"

export function ThemeColorSync() {
  const { settings } = usePublicSettings()
  const { themePrimaryColor: primary, themeAccentColor: accent } = settings

  React.useEffect(() => {
    document.documentElement.style.setProperty("--primary", primary)
    document.documentElement.style.setProperty("--ring", primary)
    document.documentElement.style.setProperty("--sidebar-accent", primary)
  }, [primary])

  React.useEffect(() => {
    document.documentElement.style.setProperty("--gold", accent)
    document.documentElement.style.setProperty("--sidebar-primary", accent)
  }, [accent])

  return null
}
