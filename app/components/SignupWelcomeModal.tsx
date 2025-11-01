'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCurrentLocale } from '@/locales/client';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';

const signupWelcomeTranslations: Record<string, Record<string, string>> = {
  en: {
    title: 'Welcome to LightMyFire!',
    subtitle: 'Thank you for joining our community! Here are a few things you can do:',
    quick_actions: 'Quick Start:',
    action_lighter: 'Save a lighter and start collecting stories',
    action_find: 'Find a lighter and add to its journey',
    action_community: 'Connect with other LightSavers worldwide',
    cta_lighter: 'Save Your First Lighter',
    cta_explore: 'Explore the Community',
    close: 'Close',
  },
  fr: {
    title: 'Bienvenue sur LightMyFire !',
    subtitle: 'Merci d\'avoir rejoint notre communauté ! Voici quelques choses que tu peux faire :',
    quick_actions: 'Démarrage rapide :',
    action_lighter: 'Sauvegarde un briquet et commence à collecter des histoires',
    action_find: 'Trouve un briquet et ajoute à son voyage',
    action_community: 'Connecte-toi avec d\'autres LightSavers dans le monde',
    cta_lighter: 'Sauvegarde ton premier briquet',
    cta_explore: 'Explore la communauté',
    close: 'Fermer',
  },
  de: {
    title: 'Willkommen bei LightMyFire!',
    subtitle: 'Danke, dass du unsere Gemeinschaft beigetreten bist! Hier sind ein paar Dinge, die du tun kannst:',
    quick_actions: 'Schnellstart:',
    action_lighter: 'Speichere ein Feuerzeug und sammle Geschichten',
    action_find: 'Finde ein Feuerzeug und trage zu seiner Geschichte bei',
    action_community: 'Verbinde dich mit anderen LightSavers auf der ganzen Welt',
    cta_lighter: 'Speichere dein erstes Feuerzeug',
    cta_explore: 'Erkunde die Gemeinschaft',
    close: 'Schließen',
  },
  es: {
    title: '¡Bienvenido a LightMyFire!',
    subtitle: '¡Gracias por unirte a nuestra comunidad! Aquí hay algunas cosas que puedes hacer:',
    quick_actions: 'Inicio rápido:',
    action_lighter: 'Guarda un encendedor y comienza a recopilar historias',
    action_find: 'Encuentra un encendedor y agrega a su viaje',
    action_community: 'Conecta con otros LightSavers en todo el mundo',
    cta_lighter: 'Guarda tu primer encendedor',
    cta_explore: 'Explora la comunidad',
    close: 'Cerrar',
  },
};

export default function SignupWelcomeModal() {
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  // Get translations for current locale, fallback to English
  const translations = signupWelcomeTranslations[locale] || signupWelcomeTranslations.en;
  const t = (key: string) => translations[key as keyof typeof translations] || signupWelcomeTranslations.en[key as keyof typeof signupWelcomeTranslations.en];

  useEffect(() => {
    // Show modal only on signup_success
    if (searchParams.get('signup_success') === 'true') {
      setIsVisible(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white px-6 py-4 flex items-center justify-between border-b border-border">
          <h2 className="text-xl font-bold">
            🎉 {t('title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={t('close')}
          >
            <XMarkIcon className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-foreground text-sm leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm">
              {t('quick_actions')}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">✨</span>
                <span>{t('action_lighter')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">🔍</span>
                <span>{t('action_find')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">👥</span>
                <span>{t('action_community')}</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/${locale}/save-a-lighter`}
              className="block text-center px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
              onClick={handleClose}
            >
              {t('cta_lighter')}
            </Link>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold text-sm"
            >
              {t('cta_explore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
