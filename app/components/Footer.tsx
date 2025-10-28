import Link from 'next/link';

// Placeholder Social Icon component - Replace with actual SVGs or an icon library later
const SocialIcon = ({ href, IconComponent, name }: { href: string; IconComponent: React.ElementType; name: string }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    <span className="sr-only">{name}</span>
    <IconComponent className="h-6 w-6" aria-hidden="true" />
  </Link>
);

// Placeholder SVG components (replace with actual icons or library like react-icons)
const InstagramIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.272.058 1.877.218 2.368.42 1.054.433 1.66 1.04 2.094 2.094.202.49.362 1.096.42 2.368.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.058 1.272-.218 1.877-.42 2.368-.433 1.054-1.04 1.66-2.094 2.094-.49.202-1.096.362-2.368.42-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.272-.058-1.877-.218-2.368-.42-1.054-.433-1.66-1.04-2.094-2.094-.202-.49-.362-1.096-.42-2.368-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.058-1.272.218-1.877.42-2.368.433-1.054 1.04-1.66 2.094-2.094.49-.202 1.096-.362 2.368-.42.016-.002.032-.003.048-.004L7.15 2.163zm0 1.44c-3.196 0-3.57.013-4.823.069-1.202.054-1.748.212-2.128.378-.85.35-1.393.894-1.742 1.742-.166.38-.324.925-.378 2.128C2.176 8.41 2.163 8.784 2.163 12s.013 3.59.069 4.823c.054 1.202.212 1.748.378 2.128.35.85.894 1.393 1.742 1.742.38.166.925.324 2.128.378 1.253.056 1.627.069 4.823.069s3.57-.013 4.823-.069c1.202-.054 1.748-.212 2.128-.378.85-.35 1.393-.894 1.742-1.742.166-.38.324-.925.378-2.128.056-1.253.069-1.627.069-4.823s-.013-3.57-.069-4.823c-.054-1.202-.212-1.748-.378-2.128-.35-.85-.894-1.393-1.742-1.742-.38-.166-.925-.324-2.128-.378C15.57 2.176 15.196 2.163 12 2.163zM12 7.003c-2.757 0-4.997 2.24-4.997 4.997s2.24 4.997 4.997 4.997 4.997-2.24 4.997-4.997S14.757 7.003 12 7.003zm0 8.162c-1.745 0-3.162-1.417-3.162-3.162s1.417-3.162 3.162-3.162 3.162 1.417 3.162 3.162-1.417 3.162-3.162 3.162zm4.908-8.212c0-.594.482-1.076 1.076-1.076s1.076.482 1.076 1.076-.482 1.076-1.076 1.076-1.076-.482-1.076-1.076z"/></svg>;
const TikTokIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 2.8-5.92 2.68-1.9-.11-3.69-.83-5.11-1.96-1.42-1.13-2.55-2.61-3.3-4.31-.1-.23-.19-.46-.28-.7-.01-.06-.01-.13-.02-.19-.11-2.02-.13-4.04-.12-6.06.01-1.46.07-2.91.17-4.36.01-.13.01-.27.02-.4.04-.6.12-1.2.23-1.79.11-.59.25-1.17.43-1.74.28-.9.66-1.77 1.14-2.58.48-.81 1.05-1.55 1.72-2.21.67-.66 1.42-1.22 2.25-1.68.83-.46 1.7-.8 2.62-1.02.92-.22 1.86-.33 2.8-.31.07 1.09.11 2.19.1 3.29-.01.55-.1.97-.22 1.47-.12.49-.31.97-.56 1.43-.25.46-.57.88-.95 1.26-.38.38-.82.7-1.31.95-.49.25-1.02.43-1.57.54-.55.11-1.11.16-1.67.17-.07-.98-.06-1.95-.08-2.93-.01-.98-.01-1.96 0-2.94zm-1.87 9.17c.56 0 1.11.01 1.67-.02.5-.02 1-.1 1.48-.27.48-.17.93-.4 1.34-.7.41-.3.78-.65 1.11-1.05.33-.4.6-.84.79-1.32.2-.48.33-.98.39-1.51.06-.53.08-1.06.07-1.59-.01-1.3-.06-2.6-.17-3.89-.11-1.29-.3-2.57-.59-3.82-.29-1.25-.7-2.46-1.23-3.61-.53-1.15-1.17-2.22-1.93-3.19C14.07 1.12 13.3 1.05 12.525.02z"/></svg>;
const FacebookIcon = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10s4.5 10 10 10 10-4.49 10-10S17.5 2.04 12 2.04zm3.01 7.97h-2.02v-1.41c0-.49.23-.74.8-.74h1.18V5.04h-1.89c-2.14 0-3.07.98-3.07 3.07v1.86H8.04v2.79h1.99v7.87h3.01v-7.87h1.93l.29-2.79z"/></svg>;


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        {/* Social Links */}
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Replace # with your actual social links */}
          <SocialIcon href="#" IconComponent={InstagramIcon} name="Instagram" />
          <SocialIcon href="#" IconComponent={TikTokIcon} name="TikTok" />
          <SocialIcon href="#" IconComponent={FacebookIcon} name="Facebook" />
        </div>

        {/* Footer Links & Copyright */}
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="text-center text-xs leading-5 text-muted-foreground space-x-4 mb-4">
             <Link href="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link>
             <Link href="/legal/terms" className="hover:text-foreground">Terms of Use</Link>
             <Link href="/about" className="hover:text-foreground">About</Link>
             <Link href="/legal/faq" className="hover:text-foreground">FAQ</Link>
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