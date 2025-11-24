'use client';

import Link from 'next/link';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import { useI18n } from '@/locales/client';

/**
 * Props for the Footer component.
 */
interface FooterProps {
  /** The current language code (e.g., 'en', 'fr') for link generation. */
  lang: string;
}

/**
 * The application footer component.
 *
 * Displays:
 * - Social media links (placeholders).
 * - Legal and information links (Privacy, Terms, About, FAQ).
 * - Copyright notice.
 *
 * @param {FooterProps} props - The component props.
 * @returns {JSX.Element} The rendered footer.
 */
export default function Footer({ lang }: FooterProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useI18n() as any;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border mt-auto w-full pb-24 sm:pb-20">
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12 md:flex md:items-center md:justify-between lg:px-8">
        {/* Social Links */}
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-muted-foreground hover:text-foreground" title={t('footer.instagram_aria')}>
            <span className="sr-only">{t('footer.social.instagram')}</span>
            <FaInstagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground" title={t('footer.tiktok_aria')}>
            <span className="sr-only">{t('footer.social.tiktok')}</span>
            <FaTiktok className="h-6 w-6" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground" title={t('footer.facebook_aria')}>
            <span className="sr-only">{t('footer.social.facebook')}</span>
            <FaFacebook className="h-6 w-6" />
          </a>
        </div>

        {/* Legal and Info Links */}
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="text-center text-xs leading-5 text-muted-foreground space-x-4 mb-4">
            <Link href={`/${lang}/legal/privacy`} className="hover:text-foreground">{t('footer.links.privacy')}</Link>
            <Link href={`/${lang}/legal/terms`} className="hover:text-foreground">{t('footer.links.terms')}</Link>
            <Link href={`/${lang}/about`} className="hover:text-foreground">{t('footer.links.about')}</Link>
            <Link href={`/${lang}/legal/faq`} className="hover:text-foreground">{t('footer.links.faq')}</Link>
          </div>
          <p className="text-center text-xs leading-5 text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
            {t('footer.notice')}
          </p>
        </div>
      </div>
    </footer>
  );
}
