import Link from 'next/link';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';

export default function Footer({ lang }: { lang: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 pb-24 md:pb-12 md:flex md:items-center md:justify-between lg:px-8">
        {/* Social Links */}
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">Instagram</span>
            <FaInstagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">TikTok</span>
            <FaTiktok className="h-6 w-6" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">Facebook</span>
            <FaFacebook className="h-6 w-6" />
          </a>
        </div>

        {/* Footer Links & Copyright */}
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="text-center text-xs leading-5 text-muted-foreground space-x-4 mb-4">
             <Link href={`/${lang}/legal/privacy`} className="hover:text-foreground">Privacy Policy</Link>
             <Link href={`/${lang}/legal/terms`} className="hover:text-foreground">Terms of Use</Link>
             <Link href={`/${lang}/about`} className="hover:text-foreground">About</Link>
             <Link href={`/${lang}/legal/faq`} className="hover:text-foreground">FAQ</Link>
             {/* <Link href="/contact" className="hover:text-foreground">Contact</Link> */}
          </div>
          <p className="text-center text-xs leading-5 text-muted-foreground">
            &copy; {currentYear} Revel Editions SASU. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
            We strive to maintain a safe and responsible platform. Harmful content may occasionally appear; please use the flag feature to report it.
          </p>
        </div>
      </div>
    </footer>
  );
}
