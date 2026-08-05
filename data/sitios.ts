import type { HouseholdPurok, Sitio } from "@/types"

export const sitios: Sitio[] = [
  { id: "sitio-catarman-1", name: "Catarman 1" },
  { id: "sitio-catarman-2", name: "Catarman 2" },
  { id: "sitio-kansipak", name: "Kansipak" },
]

export const householdPuroks: HouseholdPurok[] = sitios.flatMap((sitio) =>
  [1, 2, 3].map((n) => ({
    id: `${sitio.id}-purok-${n}`,
    sitioId: sitio.id,
    name: `Purok ${n}`,
  }))
)

export function getSitio(sitioId: string): Sitio | undefined {
  return sitios.find((s) => s.id === sitioId)
}

export function getPurok(purokId: string): HouseholdPurok | undefined {
  return householdPuroks.find((p) => p.id === purokId)
}

export function getPuroksForSitio(sitioId: string): HouseholdPurok[] {
  return householdPuroks.filter((p) => p.sitioId === sitioId)
}
