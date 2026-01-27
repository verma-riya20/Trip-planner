"use client"
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Use CDN-hosted marker images to avoid importing image assets during the build.
// This avoids TypeScript/module-loader issues with importing node_modules images.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  lat: number
  lng: number
  zoom?: number
  height?: string
  markerLabel?: string
}

export default function MapView({ lat, lng, zoom = 15, height = '180px', markerLabel }: Props) {
  if (!lat || !lng) return null

  const tileUrl = process.env.NEXT_PUBLIC_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION || '&copy; OpenStreetMap contributors'

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      {/* react-leaflet props typed differently across versions; suppress narrow TS checks here */}
      {/* @ts-ignore */}
      <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        {/* @ts-ignore */}
        <TileLayer url={tileUrl} attribution={attribution} />
        {/* @ts-ignore */}
        <Marker position={[lat, lng]}>
          <Popup>{markerLabel ?? 'Location'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
