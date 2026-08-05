"use client"

import * as React from "react"
import { useSettingsStore } from "@/lib/stores/settings-store"

export function ThemeColorSync() {
  const primary = useSettingsStore((s) => s.settings.themePrimaryColor)
  const accent = useSettingsStore((s) => s.settings.themeAccentColor)

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
