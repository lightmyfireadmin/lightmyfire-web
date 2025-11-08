'use client';

import { useState } from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import LighterPersonalizationCards from './LighterPersonalizationCards';
import StripePaymentForm from './StripePaymentForm';
import StickerPreview from './StickerPreview';
import FullStickerPreview from './FullStickerPreview';
import ShippingAddressForm, { type ShippingAddress } from './ShippingAddressForm';
import ContactFormModal from '@/app/components/ContactFormModal';
import { PACK_PRICING } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

// Map locale codes to language names
const getLanguageName = (code: string): string => {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'nl': 'Nederlands',
    'ru': 'Русский',
    'pl': 'Polski',
    'ja': '日本語',
    'ko': '한국어',
    'zh-CN': '中文',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'hi': 'हिन्दी',
    'ar': 'العربية',
    'fa': 'فارسی',
    'ur': 'اردو',
    'mr': 'मराठी',
    'te': 'తెలుగు',
    'id': 'Bahasa Indonesia',
    'uk': 'Українська',
    'tr': 'Türkçe',
  };
  return languageMap[code] || code;
};

// Helper function to get pack price formatted for display
const getPackPriceDisplay = (packSize: number, locale: string): string => {
  const priceInCents = PACK_PRICING[packSize as keyof typeof PACK_PRICING];
  return priceInCents ? formatCurrency(priceInCents, 'EUR', locale) : formatCurrency(0, 'EUR', locale);
};
import type { User } from '@supabase/supabase-js';

interface LighterCustomization {
  id: string;
  name: string;
  backgroundColor: string;
  language?: string;
}

const getPackOptions = (t: any) => [
  {
    count: 10,
    sheets: 1,
    title: t('order.pack.starting_lightsaver'),
    description: t('order.pack.starting_description'),
    price: null,
  },
  {
    count: 20,
    sheets: 2,
    title: t('order.pack.committed_lightsaver'),
    description: t('order.pack.committed_description'),
    price: null,
  },
  {
    count: 50,
    sheets: 5,
    title: t('order.pack.community_lightsaver'),
    description: t('order.pack.community_description'),
    price: null,
  },
];

export default function SaveLighterFlow({ user }: { user: User }) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [customizations, setCustomizations] = useState<LighterCustomization[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [shippingRates, setShippingRates] = useState<{ standard: number; express: number } | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express'>('standard');
  const [loadingShipping, setLoadingShipping] = useState(false);

  const PACK_OPTIONS = getPackOptions(t);

  const handlePackSelect = (count: number) => {
    setSelectedPack(count);
  };

  const handleShippingSave = async (address: ShippingAddress) => {
    setShippingAddress(address);

    // Calculate shipping rates with full address for accurate Printful pricing
    setLoadingShipping(true);
    try {
      const response = await fetch('/api/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: address.country,
          packSize: selectedPack,
          address: address.address,
          city: address.city,
          postalCode: address.postalCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShippingRates({
          standard: data.rates.standard.rate,
          express: data.rates.express.rate,
        });

        // Log if fallback rates were used
        if (data.usedFallback) {
          console.log('Using fallback shipping rates (Printful API unavailable)');
        } else {
          console.log('Using live Printful shipping rates');
        }
      }
    } catch (error) {
      console.error('Failed to calculate shipping:', error);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handlePersonalizationSave = (
    customizations: LighterCustomization[],
    language: string
  ) => {
    
    const customizationsWithLanguage = customizations.map(c => ({
      ...c,
      language: language
    }));
    setCustomizations(customizationsWithLanguage);
    setSelectedLanguage(language);
    
    console.log('Customizations saved:', { customizations: customizationsWithLanguage, language });
  };

  return (
    <div className="space-y-12">
      {}
      {selectedPack === null && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-8 text-3xl font-bold text-foreground text-center">
              {t('order.choose_pack_title')}
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              {t('order.choose_pack_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PACK_OPTIONS.map((pack) => (
              <button
                key={pack.count}
                onClick={() => handlePackSelect(pack.count)}
                className="rounded-lg border-2 border-border bg-background p-6 text-center shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 group"
              >
                <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                  {pack.title}
                </h3>
                <p className="mb-4 text-3xl font-bold text-primary">
                  {t('order.pack.stickers_count', { count: pack.count })}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  {pack.sheets === 1
                    ? t('order.pack.sheet_singular', { count: pack.sheets })
                    : t('order.pack.sheets_count', { count: pack.sheets })
                  }
                </p>
                <p className="mb-4 text-sm text-muted-foreground italic min-h-[60px] flex items-center justify-center">
                  {pack.description}
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  {t('order.price_at_checkout')}
                </p>
                <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold group-hover:shadow-lg transition-shadow">
                  {t('order.pack_select_button')}
                </span>
              </button>
            ))}
          </div>

          {}
          <div className="mt-8 rounded-lg border-2 border-primary/30 bg-primary/5 p-6">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>🎨</span>
              {t('order.custom_branding.title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('order.custom_branding.description')}
            </p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              <span>✉️</span>
              {t('order.custom_branding.button')}
            </button>
          </div>
        </div>
      )}

      {}
      {selectedPack !== null && (
        <div className="rounded-lg border border-border bg-background/95 p-8 shadow-md">
          <LighterPersonalizationCards
            stickerCount={selectedPack || 5}
            onSave={handlePersonalizationSave}
          />
        </div>
      )}

      {}
      {customizations.length > 0 && !shippingAddress && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-foreground">{t('save_lighter.your_design')}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t('save_lighter.design_preview')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {customizations.slice(0, 5).map((sticker, index) => (
              <div key={sticker.id} className="flex justify-center h-[300px]">
                <div className="transform scale-[0.6] origin-top">
                  <FullStickerPreview
                    lighterName={sticker.name}
                    pinCode={`LMF-${(index + 1).toString().padStart(2, '0')}`}
                    backgroundColor={sticker.backgroundColor}
                    language={sticker.language || selectedLanguage}
                  />
                </div>
              </div>
            ))}
            {customizations.length > 5 && (
              <div className="flex items-center justify-center text-muted-foreground text-sm">
                {t('save_lighter.more_stickers', { count: customizations.length - 5 })}
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {customizations.length > 0 && !shippingAddress && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <ShippingAddressForm onSave={handleShippingSave} userEmail={user.email || undefined} />
        </div>
      )}

      {}
      {customizations.length > 0 && shippingAddress && (
        <>
          {/* Order Summary - Basic Info Only */}
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{t('order.summary.title')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex justify-between">
                <span>{t('order.summary.pack')}</span>
                <span className="font-semibold text-foreground">
                  {selectedPack} {selectedPack === 1 ? t('save_lighter.sticker_singular') : t('save_lighter.sticker_plural')}
                </span>
              </div>
              {customizations.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>{t('order.summary.language')}</span>
                    <span className="font-semibold text-foreground">{getLanguageName(selectedLanguage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('order.summary.stickers')}</span>
                    <span className="font-semibold text-foreground">
                      {t('order.summary.customized')}
                    </span>
                  </div>
                </>
              )}
              {shippingRates && (
                <>
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-sm font-semibold text-foreground mb-2">{t('order.summary.shipping_method')}</p>
                    <div className="space-y-2">
                      <label className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedShipping === 'standard' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="standard"
                            checked={selectedShipping === 'standard'}
                            onChange={() => setSelectedShipping('standard')}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <p className="font-medium text-foreground">{t('order.summary.shipping_standard')}</p>
                            <p className="text-xs text-muted-foreground">{t('order.summary.shipping_standard_time')}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(shippingRates.standard, 'EUR', locale)}</span>
                      </label>
                      <label className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedShipping === 'express' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="express"
                            checked={selectedShipping === 'express'}
                            onChange={() => setSelectedShipping('express')}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <p className="font-medium text-foreground">{t('order.summary.shipping_express')}</p>
                            <p className="text-xs text-muted-foreground">{t('order.summary.shipping_express_time')}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(shippingRates.express, 'EUR', locale)}</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Form with Integrated Pricing */}
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {t('save_lighter.payment_details_title')}
            </h2>
            <StripePaymentForm
              orderId={`LMF-${Date.now()}`}
              totalAmount={
                PACK_PRICING[selectedPack as keyof typeof PACK_PRICING] +
                (shippingRates ? shippingRates[selectedShipping] : 0)
              }
              userEmail={shippingAddress.email}
              packSize={selectedPack || 10}
              lighterData={customizations.map(c => ({
                name: c.name,
                backgroundColor: c.backgroundColor,
                language: c.language || selectedLanguage
              }))}
              shippingAddress={shippingAddress}
              shippingRates={shippingRates}
              selectedShipping={selectedShipping}
              onSuccess={(lighterIds) => {

                window.location.href = `/${locale}/save-lighter/order-success?email=${encodeURIComponent(shippingAddress.email)}&count=${lighterIds.length}`;
              }}
            />
          </div>
        </>
      )}

      {}
      {selectedPack !== null && customizations.length === 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setSelectedPack(null);
              setCustomizations([]);
            }}
            className="px-6 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {t('save_lighter.change_pack')}
          </button>
        </div>
      )}

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        context="custom_branding"
      />
    </div>
  );
}
