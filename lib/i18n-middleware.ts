import { createI18nMiddleware } from 'next-international/middleware';
import { NextRequest } from 'next/server';

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
});

export function i18nMiddleware(request: NextRequest) {
  return I18nMiddleware(request);
}
