'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface LocationSearchResult {
  lat: string | number;
  lon: string | number;
  display_name: string;
  address: {
    name?: string;
    road?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface LocationPickerProps {
  value: { name: string; lat: number | ''; lng: number | '' };
  onChange: (value: { name: string; lat: number | ''; lng: number | '' }) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<NodeJS.Timeout>();

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      searchLocations(query);
    }, 500);
  };

  const handleSelectLocation = (result: LocationSearchResult) => {
    const locationName = result.address?.name || result.address?.road || result.display_name.split(',')[0];
    const lat = typeof result.lat === 'string' ? parseFloat(result.lat) : result.lat;
    const lon = typeof result.lon === 'string' ? parseFloat(result.lon) : result.lon;
    onChange({
      name: locationName,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lon.toFixed(6)),
    });
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      {}
      <div className="rounded-lg border border-input bg-background p-4">
        <p className="text-sm text-muted-foreground mb-2">Selected Location</p>
        <p className="text-lg font-semibold text-foreground">
          {value.name || 'No location selected'}
        </p>
        {value.lat && value.lng && (
          <>
            <p className="text-xs text-muted-foreground mt-2">
              📍 {value.lat}, {value.lng}
            </p>
            {/* OpenStreetMap Preview */}
            <div className="mt-3 rounded overflow-hidden border border-border">
              <iframe
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${value.lng - 0.01},${value.lat - 0.01},${value.lng + 0.01},${value.lat + 0.01}&layer=mapnik&marker=${value.lat},${value.lng}`}
                style={{ border: 0 }}
              />
              <div className="text-xs text-center py-1 bg-muted">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=15/${value.lat}/${value.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View larger map
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {}
      <div className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            placeholder="Search for a location (city, address, landmark)..."
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground focus:border-primary focus:ring-primary"
          />
          {isSearching && (
            <div className="absolute right-3">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-50">
            {searchResults.map((result, index) => {
              const shortName = result.address?.name || result.address?.road || result.display_name.split(',')[0];
              const fullAddress = result.display_name;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border/50 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-foreground">{shortName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{fullAddress}</div>
                </button>
              );
            })}
          </div>
        )}

        {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-background shadow-lg p-4 z-50">
            <p className="text-sm text-muted-foreground text-center">No locations found. Try a different search term.</p>
          </div>
        )}
      </div>

      {}
      {value.lat && value.lng && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Edit coordinates manually
          </summary>
          <div className="mt-3 space-y-2">
            <input
              type="number"
              value={value.lat}
              onChange={(e) => onChange({ ...value, lat: parseFloat(e.target.value) || '' })}
              placeholder="Latitude"
              step="any"
              className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground"
            />
            <input
              type="number"
              value={value.lng}
              onChange={(e) => onChange({ ...value, lng: parseFloat(e.target.value) || '' })}
              placeholder="Longitude"
              step="any"
              className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground"
            />
          </div>
        </details>
      )}
    </div>
  );
}
