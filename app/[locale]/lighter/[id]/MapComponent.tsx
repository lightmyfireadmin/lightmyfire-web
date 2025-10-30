'use client';

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  name?: string;
}

interface MapComponentProps {
  locations: LocationData[];
}

export default function MapComponent({ locations }: MapComponentProps) {
  if (!locations || locations.length === 0) {
    return <p>No location data available for this lighter yet.</p>;
  }

  const path = locations.map(loc => [loc.lat, loc.lng] as [number, number]);
  const center = path[0]; // Center map on the first location

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.lat, loc.lng]} title={loc.name || `Location ${index + 1}`} />
      ))}
      {path.length > 1 && <Polyline positions={path} color="blue" />}
    </MapContainer>
  );
}
