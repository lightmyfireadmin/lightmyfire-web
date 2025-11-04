'use client';

import { useState } from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import LighterPersonalizationCards from './LighterPersonalizationCards';
import StripePaymentForm from './StripePaymentForm';
import StickerPreview from './StickerPreview';
import ShippingAddressForm, { type ShippingAddress } from './ShippingAddressForm';
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

  const PACK_OPTIONS = getPackOptions(t);

  const handlePackSelect = (count: number) => {
    setSelectedPack(count);
  };

  const handleShippingSave = (address: ShippingAddress) => {
    setShippingAddress(address);
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
              Choose Your Pack
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Select how many custom stickers you want to order
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
                  {pack.count} Stickers
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  ({pack.sheets} {pack.sheets === 1 ? 'sheet' : 'sheets'})
                </p>
                <p className="mb-4 text-sm text-muted-foreground italic min-h-[60px] flex items-center justify-center">
                  {pack.description}
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Price calculated at checkout
                </p>
                <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold group-hover:shadow-lg transition-shadow">
                  Select
                </span>
              </button>
            ))}
          </div>

          {}
          <div className="mt-8 rounded-lg border-2 border-primary/30 bg-primary/5 p-6">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>🎨</span>
              Custom Branding for Events & Brands
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Planning an event or want custom branding on your sticker sheets? We can personalize the branding area for your organization, brand, or special event!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:editionsrevel@gmail.com?subject=Custom%20Branding%20Request%20-%20LightMyFire&body=Hi!%20I'm%20interested%20in%20custom%20branding%20for%20my%20sticker%20order.%0A%0ADetails:%0A-%20Organization/Brand:%0A-%20Event%20(if%20applicable):%0A-%20Estimated%20quantity:%0A-%20Additional%20notes:%0A"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                <span>✉️</span>
                Contact Us for Custom Branding
              </a>
              <div className="text-xs text-muted-foreground self-center">
                editionsrevel@gmail.com
              </div>
            </div>
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
      {selectedPack !== null && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Order Summary</h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex justify-between">
              <span>Pack:</span>
              <span className="font-semibold text-foreground">
                {selectedPack} {selectedPack === 1 ? 'Sticker' : 'Stickers'}
              </span>
            </div>
            {customizations.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-semibold text-foreground">{selectedLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stickers:</span>
                  <span className="font-semibold text-foreground">
                    ✓ Customized
                  </span>
                </div>
              </>
            )}
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total: </span>
                <span className="font-bold text-primary text-lg">
                  {selectedPack === 5 && '€25.00'}
                  {selectedPack === 10 && '€45.00'}
                  {selectedPack === 50 && '€200.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {customizations.length > 0 && !shippingAddress && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Your Sticker Design</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Preview of your custom stickers. Sticker files will be generated after payment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {customizations.slice(0, 5).map((sticker, index) => (
              <div key={sticker.id} className="flex justify-center">
                <div
                  className="w-24 h-60 rounded-md shadow-sm"
                  style={{ backgroundColor: sticker.backgroundColor }}
                />
              </div>
            ))}
            {customizations.length > 5 && (
              <div className="flex items-center justify-center text-muted-foreground text-sm">
                +{customizations.length - 5} more
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
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            {t('save_lighter.payment_details_title')}
          </h2>
          <StripePaymentForm
            orderId={`LMF-${Date.now()}`}
            totalAmount={
              selectedPack === 10 ? 2500 : selectedPack === 20 ? 4500 : 10000
            }
            userEmail={shippingAddress.email}
            packSize={selectedPack || 10}
            lighterData={customizations.map(c => ({
              name: c.name,
              backgroundColor: c.backgroundColor,
              language: c.language || selectedLanguage
            }))}
            shippingAddress={shippingAddress}
            onSuccess={(lighterIds) => {
              
              window.location.href = `/${locale}/save-lighter/order-success?email=${encodeURIComponent(shippingAddress.email)}&count=${lighterIds.length}`;
            }}
          />
        </div>
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
            ← Change Pack
          </button>
        </div>
      )}
    </div>
  );
}
