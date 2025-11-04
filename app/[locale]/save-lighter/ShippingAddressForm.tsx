'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';

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

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgium' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ShippingAddressForm({ onSave, userEmail }: ShippingAddressFormProps) {
  const t = useI18n();
  const [formData, setFormData] = useState<ShippingAddress>({
    name: '',
    email: userEmail || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR', 
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';

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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Shipping Information</h3>
        <p className="text-sm text-muted-foreground">
          Please provide your shipping address for sticker delivery
        </p>

        {}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.name ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.email ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
            Street Address *
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.address ? 'border-red-500' : 'border-border'
            } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="123 Main Street, Apt 4B"
          />
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
              City *
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.city ? 'border-red-500' : 'border-border'
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Paris"
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
              Postal Code *
            </label>
            <input
              id="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.postalCode ? 'border-red-500' : 'border-border'
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="75001"
            />
            {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
          </div>
        </div>

        {}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
            Country *
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
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
