'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/locales/client';
import { postcodeValidator } from 'postcode-validator';

export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingAddressFormProps {
  onSave: (address: ShippingAddress) => void;
  userEmail?: string;
}

export default function ShippingAddressForm({ onSave, userEmail }: ShippingAddressFormProps) {
  const t = useI18n();

  const COUNTRIES = [
    { code: 'AT', name: t('country.AT') },
    { code: 'BE', name: t('country.BE') },
    { code: 'CA', name: t('country.CA') },
    { code: 'CH', name: t('country.CH') },
    { code: 'CZ', name: t('country.CZ') },
    { code: 'DE', name: t('country.DE') },
    { code: 'DK', name: t('country.DK') },
    { code: 'ES', name: t('country.ES') },
    { code: 'FI', name: t('country.FI') },
    { code: 'FR', name: t('country.FR') },
    { code: 'GB', name: t('country.GB') },
    { code: 'IE', name: t('country.IE') },
    { code: 'IT', name: t('country.IT') },
    { code: 'LU', name: t('country.LU') },
    { code: 'NL', name: t('country.NL') },
    { code: 'NO', name: t('country.NO') },
    { code: 'PL', name: t('country.PL') },
    { code: 'PT', name: t('country.PT') },
    { code: 'SE', name: t('country.SE') },
    { code: 'US', name: t('country.US') },
  ].sort((a, b) => a.name.localeCompare(b.name));
  const [formData, setFormData] = useState<ShippingAddress>({
    name: '',
    email: userEmail || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!formData.name.trim()) newErrors.name = t('order.shipping.error_name');
    if (!formData.email.trim()) newErrors.email = t('order.shipping.error_email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('order.shipping.error_email_invalid');
    }
    if (!formData.address.trim()) newErrors.address = t('order.shipping.error_address');
    if (!formData.city.trim()) newErrors.city = t('order.shipping.error_city');
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('order.shipping.error_postal');
    } else if (formData.country && !postcodeValidator(formData.postalCode, formData.country)) {
      newErrors.postalCode = t('order.shipping.error_postal_invalid');
    }
    if (!formData.country) newErrors.country = t('order.shipping.error_country');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Trigger address search when typing in address field
    if (field === 'address' && value.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(value);
      }, 500);
    } else if (field === 'address' && value.length <= 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Search address using OpenStreetMap Nominatim
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'LightMyFire-App',
          },
        }
      );
      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address selection from suggestions
  const handleAddressSelect = (suggestion: any) => {
    const address = suggestion.address;

    // Extract address components
    const streetNumber = address.house_number || '';
    const street = address.road || address.street || '';
    const city = address.city || address.town || address.village || address.municipality || '';
    const postalCode = address.postcode || '';
    const countryCode = address.country_code?.toUpperCase() || '';

    // Build full street address
    const fullAddress = `${streetNumber} ${street}`.trim();

    setFormData((prev) => ({
      ...prev,
      address: fullAddress || suggestion.display_name,
      city: city || prev.city,
      postalCode: postalCode || prev.postalCode,
      country: countryCode || prev.country,
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);
    setErrors({});
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{t('order.shipping.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('order.shipping.description')}
          </p>

        {}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            {t('order.shipping.name_label')}
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.name ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder={t('order.shipping.name_placeholder')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            {t('order.shipping.email_label')}
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.email ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder={t('order.shipping.email_placeholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {}
        <div className="relative">
          <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
            {t('order.shipping.address_label')}
            <span className="ml-2 text-xs text-muted-foreground">
              (Start typing for suggestions)
            </span>
          </label>
          <input
            ref={addressInputRef}
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.address ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder={t('order.shipping.address_placeholder')}
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-3 top-11 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {showSuggestions && addressSuggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {addressSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleAddressSelect(suggestion)}
                  className="px-4 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                >
                  <div className="text-sm text-foreground">{suggestion.display_name}</div>
                </li>
              ))}
            </ul>
          )}
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
              {t('order.shipping.city_label')}
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.city ? 'border-red-500' : 'border-border'
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t('order.shipping.city_placeholder')}
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
              {t('order.shipping.postal_code_label')}
            </label>
            <input
              id="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.postalCode ? 'border-red-500' : 'border-border'
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder={t('order.shipping.postal_code_placeholder')}
            />
            {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
          </div>
        </div>

        {}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
            {t('order.shipping.country_label')}
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.country ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
        </div>
      </div>

      {}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {t('order.shipping.continue_button')}
        </button>
      </div>
    </form>
  );
}
