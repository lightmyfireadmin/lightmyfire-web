'use client';

import { createI18nClient } from 'next-international/client';

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useCurrentLocale,
  useChangeLocale,
} = createI18nClient({
  en: () => import('./en'),
  fr: () => import('./fr'),
  de: () => import('./de'),
  es: () => import('./es'),
  uk: () => import('./uk'),
  ar: () => import('./ar'),
  fa: () => import('./fa'),
  hi: () => import('./hi'),
  id: () => import('./id'),
  it: () => import('./it'),
  ja: () => import('./ja'),
  ko: () => import('./ko'),
  mr: () => import('./mr'),
  nl: () => import('./nl'),
  pl: () => import('./pl'),
  pt: () => import('./pt'),
  ru: () => import('./ru'),
  te: () => import('./te'),
  th: () => import('./th'),
  tr: () => import('./tr'),
  ur: () => import('./ur'),
  vi: () => import('./vi'),
  'zh-CN': () => import('./zh-CN'),
});