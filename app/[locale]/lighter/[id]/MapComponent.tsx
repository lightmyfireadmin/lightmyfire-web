'use client';

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

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

const DynamicMap = ({ locations }: MapComponentProps) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = new L.LatLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds);
    }
  }, [locations, map]);

  const path = locations.map(loc => [loc.lat, loc.lng] as [number, number]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.lat, loc.lng]} title={loc.name || `Location ${index + 1}`} />
      ))}
      {path.length > 1 && <Polyline positions={path} color="#B400A3" />}
    </>
  );
};

export default function MapComponent({ locations }: MapComponentProps) {
  if (!locations || locations.length === 0) {
    return <p>No location data available for this lighter yet.</p>;
  }

  return (
    <MapContainer center={[locations[0].lat, locations[0].lng]} zoom={13} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
      <DynamicMap locations={locations} />
    </MapContainer>
  );
}
