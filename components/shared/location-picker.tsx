"use client"

import * as React from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const CATARMAN_CENTER: [number, number] = [12.5, 124.65]

interface LocationPickerProps {
  value?: { lat: number; lng: number }
  onChange: (value: { lat: number; lng: number }) => void
}

function ClickHandler({ onChange }: { onChange: (value: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const position: [number, number] = value ? [value.lat, value.lng] : CATARMAN_CENTER

  return (
    <div className="space-y-2">
      <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
        <MapContainer center={position} zoom={15} className="h-full w-full" scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
          <ClickHandler onChange={onChange} />
        </MapContainer>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        Click on the map to pin the exact incident location{value ? ` (${value.lat.toFixed(5)}, ${value.lng.toFixed(5)})` : ""}.
      </p>
    </div>
  )
}
