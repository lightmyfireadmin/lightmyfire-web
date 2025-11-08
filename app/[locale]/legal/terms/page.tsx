
'use client';

import { useI18n } from '@/locales/client';

export default function TermsOfService() {
  const t = useI18n() as any;

  return (
    <div className="mx-auto max-w-3xl p-4 py-12 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-6 text-center text-4xl font-bold text-foreground">
          {t('legal.terms.title')}
        </h1>
          <div className="prose prose-lg max-w-none">
            <p className="lead">Last updated: October 28, 2025</p>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use
              of the LightMyFire website and services (the &quot;Service&quot;),
              operated by Revel Editions, SASU.
            </p>
  
            <h3>1. Acceptance of Terms</h3>
            <p>
              By creating an account or using our Service, you agree to be
              bound by these Terms. If you do not agree, do not use the
              Service.
            </p>
  
            <h3>2. User Accounts</h3>
            <p>
              You must be at least 16 years old (or the minimum age
              required in your country to consent to data processing) to
              create an account. You are responsible for safeguarding your
              password and for all activities that occur under your
              account.
            </p>
  
            <h3>3. User-Generated Content (UGC)</h3>
            <p>
              You are solely responsible for the content you post
              (&quot;UGC&quot;), including text, images, and links. You must not
              post content that is:
            </p>
            <ul>
              <li>Illegal, hateful, discriminatory, or threatening.</li>
              <li>
                Infringes on any third party&apos;s intellectual property
                (e.g., copyright).
              </li>
              <li>Spam or unauthorized advertising.</li>
              <li>Malicious (e.g., contains viruses).</li>
            </ul>
  
            <h3>4. License to Your Content</h3>
            <p>
              By posting UGC on the Service, you grant Revel Editions a
              non-exclusive, worldwide, royalty-free, perpetual license to
              use, display, reproduce, and distribute your content *solely
              for the purpose of operating and promoting the LightMyFire
              Service*. You can revoke this license for a specific post by
              deleting it from your profile.
            </p>
  
            <h3>5. Moderation</h3>
            <p>
              We have the right (but not the obligation) to review,
              screen, and remove any UGC that violates these Terms. We use
              a community-driven flagging system to identify problematic
              content. We reserve the right to suspend or terminate
              accounts that repeatedly violate our policies.
            </p>
            
            <h3>6. Sticker Sales</h3>
            <p>
              All sales of LightMyFire stickers are final. Prices and
              shipping terms will be specified at the time of purchase.
              [You will need to add more detail here as you build your
              checkout flow].
            </p>
  
            <h3>7. Limitation of Liability</h3>
            <p>
              The Service is provided &quot;as is.&quot; Revel Editions, SASU will
              not be liable for any indirect, incidental, or consequential
              damages, including loss of data or content.
            </p>
  
            <h3>8. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance
              with the laws of France.
            </p>
          </div>
        </div>
      </div>
    );
  }