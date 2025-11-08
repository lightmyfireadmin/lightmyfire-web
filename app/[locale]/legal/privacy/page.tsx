
'use client';

import { useI18n } from '@/locales/client';

export default function PrivacyPolicy() {
  const t = useI18n() as any;

  return (
    <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-6 text-center text-4xl font-bold text-foreground">
          {t('legal.privacy.title')}
        </h1>
          <div className="prose prose-lg max-w-none">
            <p className="lead">Last updated: October 28, 2025</p>
  
            <p>
              LightMyFire (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a project operated by
              Revel Editions, a SASU domiciliated in France. We are
              committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website.
            </p>
  
            <h3>1. Data Controller</h3>
            <p>
              The data controller for your personal information is:
              <br />
              Revel Editions, SASU
              <br />
              145 Rue de Noisy-le-Sec<br />
              93260 Les Lilas, France
              <br />
              <strong>Contact Email:</strong> support@lightmyfire.app
              <br />
              <strong>Data Protection Officer:</strong> support@lightmyfire.app
            </p>
  
            <h3>2. Information We Collect</h3>
            <p>We may collect personal information from you in several ways:</p>
            <ul>
              <li>
                <strong>Personal Data You Provide:</strong> When you register for an
                account, we collect your email address, a hashed password, and
                a username.
              </li>
              <li>
                <strong>User-Generated Content:</strong> When you add to a
                lighter&apos;s story, we collect the content you provide, which
                may include text, images, links to songs (YouTube URLs), and
                location names.
              </li>
              <li>
                <strong>Transaction Data:</strong> If you purchase stickers, we will
                collect payment and shipping information (processed by a
                third-party payment processor, e.g., Stripe or PayPal).
              </li>
              <li>
                <strong>Technical Data:</strong> We automatically collect certain
                information when you visit, such as your IP address and
                cookie data, which is necessary for authentication and
                security.
              </li>
            </ul>
  
            <h3>3. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Provide the core service of the website.</li>
              <li>Display your contributions on lighter pages.</li>
              <li>
                Implement gamification features (levels, trophies) and
                anti-spam measures.
              </li>
              <li>Process your sticker orders.</li>
              <li>Moderate content and enforce our Terms of Service.</li>
            </ul>
  
            <h3>4. Legal Basis for Processing (GDPR)</h3>
            <p>We process your personal data on the following legal bases:</p>
            <ul>
              <li>
                <strong>Performance of a Contract:</strong> To provide the
                services you requested upon signing up.
              </li>
              <li>
                <strong>Legitimate Interests:</strong> For security,
                moderation, and anti-spam, which are necessary for the
                proper functioning of our service.
              </li>
              <li>
                <strong>Consent:</strong> For any non-essential cookies or
                marketing communications (which you can opt-out of).
              </li>
            </ul>
  
            <h3>5. Data Sharing and Processors</h3>
            <p>We do not sell your personal data. We may share it with:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> Our backend provider, who stores
                our database, user authentication data, and file uploads.
                They act as a data processor on our behalf.
              </li>
              <li>
                <strong>Payment Processors:</strong> To handle sticker sales.
              </li>
            </ul>

            <h3>5.1. Cookies</h3>
            <p>
              We use essential cookies to manage user sessions, authentication, and preferences.
              We also use non-essential cookies for analytics and to improve user experience,
              only with your explicit consent. You can manage your cookie preferences through
              the consent banner displayed on your first visit.
            </p>

            <h3>5.2. Location Data</h3>
            <p>
              When you create a &quot;location&quot; post, you have the option to provide geographical coordinates (latitude and longitude).
              This data is used to display the lighter&apos;s journey on a map. This information is publicly visible on the lighter&apos;s page.
              You are responsible for the accuracy and privacy implications of any location data you choose to share.
            </p>

            <h3>5.3. Data Retention</h3>
            <p>
              We retain your personal data for as long as necessary to provide the services you have requested,
              or for other essential purposes such as complying with our legal obligations, resolving disputes,
              and enforcing our policies.
            </p>
  
            <h3>6. Your Rights Under GDPR</h3>
            <p>
              As you are protected by GDPR, you have the right to:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of your personal data.
              </li>
              <li>
                <strong>Rectification:</strong> Correct inaccurate data.
              </li>
              <li>
                <strong>Erasure (&quot;Right to be Forgotten&quot;):</strong>
                Request deletion of your data. You can delete your own
                contributions at any time from your &quot;My Profile&quot; page.
              </li>
              <li>
                <strong>Portability:</strong> Request your data in a machine-readable format.
              </li>
              <li>
                <strong>Object:</strong> Object to our processing of your
                data.
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us at <strong>support@lightmyfire.app</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }