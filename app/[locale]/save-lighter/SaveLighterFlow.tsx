'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import LighterPersonalizationCards from './LighterPersonalizationCards';
import StripePaymentForm from './StripePaymentForm';
import type { User } from '@supabase/supabase-js';

interface LighterCustomization {
  id: string;
  name: string;
  backgroundColor: string;
}

const PACK_OPTIONS = [
  { count: 5, price: '€25', title: 'Starter Pack' },
  { count: 10, price: '€45', title: 'Creator Pack' },
  { count: 50, price: '€200', title: 'Community Pack' },
];

export default function SaveLighterFlow({ user }: { user: User }) {
  const t = useI18n();
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [customizations, setCustomizations] = useState<LighterCustomization[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handlePackSelect = (count: number) => {
    setSelectedPack(count);
  };

  const handlePersonalizationSave = (
    customizations: LighterCustomization[],
    language: string
  ) => {
    setCustomizations(customizations);
    setSelectedLanguage(language);
    // Show success message or move to next step
    console.log('Customizations saved:', { customizations, language });
  };

  return (
    <div className="space-y-12">
      {/* Pack Selection - Only show if no pack selected */}
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
                <h3 className="mb-2 text-2xl font-semibold text-foreground group-hover:text-primary">
                  {pack.title}
                </h3>
                <p className="mb-4 text-4xl font-bold text-primary">{pack.price}</p>
                <p className="mb-6 text-lg font-bold text-foreground">
                  {pack.count} {pack.count === 1 ? 'Sticker' : 'Stickers'}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  {pack.count === 5 && 'Perfect for starting your collection'}
                  {pack.count === 10 && 'Most popular choice for creators'}
                  {pack.count === 50 && 'Best value for community builders'}
                </p>
                <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold group-hover:shadow-lg transition-shadow">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Personalization Cards - Show directly after pack selection */}
      {selectedPack !== null && (
        <div className="rounded-lg border border-border bg-background/95 p-8 shadow-md">
          <LighterPersonalizationCards
            stickerCount={selectedPack || 5}
            onSave={handlePersonalizationSave}
          />
        </div>
      )}

      {/* Order Summary */}
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

      {/* Delivery Details */}
      {selectedPack !== null && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Delivery Details</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Shipping address and expected delivery information will be shown during checkout.
          </p>
          <p className="text-muted-foreground text-sm">
            Our hand-made stickers are carefully packaged and shipped within 5-7 business days.
          </p>
        </div>
      )}

      {/* Payment Form - Show when customizations are done */}
      {customizations.length > 0 && (
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            {t('save_lighter.payment_details_title')}
          </h2>
          <StripePaymentForm
            orderId={`LMF-${Date.now()}`}
            totalAmount={
              selectedPack === 5 ? 2500 : selectedPack === 10 ? 4500 : 20000
            }
            userEmail={user.email || ''}
            onSuccess={() => {
              // Handle success
            }}
          />
        </div>
      )}

      {/* Back Button - Show when customizations not started yet */}
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
