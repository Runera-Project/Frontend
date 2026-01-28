'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: [number, number];
  route: [number, number][];
  isRecording: boolean;
}

// Component to update map view
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function MapView({ center, route, isRecording }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Custom icon for current position
  const currentPositionIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
        ${isRecording ? '<circle cx="12" cy="12" r="12" fill="#3B82F6" opacity="0.3"/>' : ''}
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Start position icon
  const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#10B981" stroke="white" stroke-width="3"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      <MapUpdater center={center} />
      
      {/* Route polyline */}
      {route.length > 1 && (
        <Polyline
          positions={route}
          color="#3B82F6"
          weight={5}
          opacity={0.8}
        />
      )}
      
      {/* Start marker */}
      {route.length > 0 && (
        <Marker position={route[0]} icon={startIcon} />
      )}
      
      {/* Current position marker */}
      <Marker position={center} icon={currentPositionIcon} />
    </MapContainer>
  );
}
