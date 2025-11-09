'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); 
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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
      {}
      <div className="relative z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-2 focus:ring-primary transition pr-10"
            placeholder="Search for a location..."
            aria-label="Search for a location"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
        {}
        {searchResults.length > 0 && searchQuery && !isSearching && (
          <ul
            className="absolute top-full left-0 right-0 z-[9999] border border-border rounded-lg bg-background max-h-60 overflow-y-auto mt-2 shadow-xl"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            {searchResults.map((result) => (
              <li
                key={result.display_name}
                onClick={() => handleSelectResult(result)}
                className="p-3 cursor-pointer hover:bg-muted transition border-b border-border last:border-b-0 text-sm"
              >
                <div className="font-medium text-foreground">{result.display_name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {}
      <div style={{ height: '300px', width: '100%', position: 'relative', zIndex: 0 }}>
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
