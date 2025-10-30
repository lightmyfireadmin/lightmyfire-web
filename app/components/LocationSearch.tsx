'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet icon setup
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`
    );
    const data = await response.json();
    setSearchResults(data);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat as any);
    const lng = parseFloat(result.lon as any);
    setSelectedLocation([lat, lng]);
    setMapCenter([lat, lng]);
    onLocationSelect(lat, lng, result.display_name);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center);
    }, [center, map]);
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary"
          placeholder="Search for a location..."
        />
        <button
          type="button"
          onClick={handleSearch}
          className="btn-secondary"
        >
          Search
        </button>
      </div>
      {searchResults.length > 0 && (
        <ul className="border border-border rounded-md max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <li
              key={result.display_name}
              onClick={() => handleSelectResult(result)}
              className="p-2 cursor-pointer hover:bg-muted"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      <div style={{ height: '300px', width: '100%' }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {selectedLocation && <Marker position={selectedLocation}></Marker>}
          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationSearch;
