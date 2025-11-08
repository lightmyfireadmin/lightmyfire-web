'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/locales/client';

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
  const t = useI18n() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapConsent, setMapConsent] = useState(false);
  const searchRef = useRef<NodeJS.Timeout>();

  // Check localStorage for map consent
  useEffect(() => {
    const consent = localStorage.getItem('osm_map_consent');
    if (consent === 'true') {
      setMapConsent(true);
    }
  }, []);

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

  const handleMapConsent = () => {
    localStorage.setItem('osm_map_consent', 'true');
    setMapConsent(true);
  };

  return (
    <div className="space-y-4">
      {}
      <div className="rounded-lg border border-input bg-background p-4">
        <p className="text-sm text-muted-foreground mb-2">{t('location.selected_location')}</p>
        <p className="text-lg font-semibold text-foreground">
          {value.name || t('location.no_location_selected')}
        </p>
        {value.lat && value.lng && (
          <>
            <p className="text-xs text-muted-foreground mt-2">
              📍 {value.lat}, {value.lng}
            </p>
            {/* OpenStreetMap Preview */}
            <div className="mt-3 rounded overflow-hidden border border-border">
              {mapConsent ? (
                <>
                  <div className="relative">
                    <iframe
                      width="100%"
                      height="200"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${value.lng - 0.005},${value.lat - 0.005},${value.lng + 0.005},${value.lat + 0.005}&layer=mapnik&marker=${value.lat},${value.lng}`}
                      style={{ border: 0 }}
                      title={t('location.map_title')}
                    />
                    {/* Center marker indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center py-1 bg-muted">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${value.lat}&mlon=${value.lng}#map=16/${value.lat}/${value.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t('location.view_larger_map')}
                    </a>
                  </div>
                </>
              ) : (
                <div className="bg-muted p-6 text-center space-y-3">
                  <div className="text-4xl">🗺️</div>
                  <p className="text-sm text-foreground font-medium">{t('location.map_preview_title')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('location.map_consent_description')}
                  </p>
                  <button
                    type="button"
                    onClick={handleMapConsent}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t('location.show_map_button')}
                  </button>
                </div>
              )}
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
            placeholder={t('location.search_placeholder')}
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
          <div
            className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-50"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
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
            <p className="text-sm text-muted-foreground text-center">{t('location.no_results')}</p>
          </div>
        )}
      </div>

      {}
      {value.lat && value.lng && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            {t('location.edit_coordinates')}
          </summary>
          <div className="mt-3 space-y-2">
            <input
              type="number"
              value={value.lat}
              onChange={(e) => onChange({ ...value, lat: parseFloat(e.target.value) || '' })}
              placeholder={t('location.latitude_placeholder')}
              step="any"
              className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground"
            />
            <input
              type="number"
              value={value.lng}
              onChange={(e) => onChange({ ...value, lng: parseFloat(e.target.value) || '' })}
              placeholder={t('location.longitude_placeholder')}
              step="any"
              className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground"
            />
          </div>
        </details>
      )}
    </div>
  );
}
