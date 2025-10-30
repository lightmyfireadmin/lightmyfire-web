import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SaveLighterForm from './SaveLighterForm'; // Import our new form
import { getI18n } from '@/locales/server';

export const dynamic = 'force-dynamic';

export default async function SaveLighterPage() {
  const t = await getI18n();
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?message=You must be logged in to save a lighter');
  }

  // We found a session! Pass the user to the form.
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="mb-4 text-3xl font-bold text-foreground">
        {t('save_lighter.title')}
      </h1>
      <p className="mb-6 text-lg text-muted-foreground">
        {t('save_lighter.introduction')}
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sticker Pack 1 */}
        <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">{t('save_lighter.pack_5.title')}</h2>
          <p className="mb-4 text-4xl font-bold text-primary">{t('save_lighter.pack_5.price')}</p>
          <p className="mb-4 text-muted-foreground">{t('save_lighter.pack_5.description')}</p>
          <button className="btn-primary w-full">{t('save_lighter.buy_button')}</button>
        </div>

        {/* Sticker Pack 2 */}
        <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">{t('save_lighter.pack_10.title')}</h2>
          <p className="mb-4 text-4xl font-bold text-primary">{t('save_lighter.pack_10.price')}</p>
          <p className="mb-4 text-muted-foreground">{t('save_lighter.pack_10.description')}</p>
          <button className="btn-primary w-full">{t('save_lighter.buy_button')}</button>
        </div>

        {/* Sticker Pack 3 */}
        <div className="rounded-lg border border-border bg-background p-6 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">{t('save_lighter.pack_50.title')}</h2>
          <p className="mb-4 text-4xl font-bold text-primary">{t('save_lighter.pack_50.price')}</p>
          <p className="mb-4 text-muted-foreground">{t('save_lighter.pack_50.description')}</p>
          <button className="btn-primary w-full">{t('save_lighter.buy_button')}</button>
        </div>
      </div>

      {/* Placeholder for Stripe Integration */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">{t('save_lighter.payment_details_title')}</h2>
        <p className="text-muted-foreground">{t('save_lighter.payment_details_placeholder')}</p>
        {/* Stripe Elements will go here */}
      </div>

      <SaveLighterForm user={session.user} />
    </div>
  );
}