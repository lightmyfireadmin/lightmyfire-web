import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SaveLighterFlow from './SaveLighterFlow'; // Import new flow component
import { getI18n } from '@/locales/server';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function SaveLighterPage({ params }: { params: { locale: string } }) {
  const t = await getI18n();
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${params.locale}/login?message=You must be logged in to save a lighter`);
  }

  // We found a session! Pass the user to the form.
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          {t('save_lighter.title')}
        </h1>
        <p className="mb-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('save_lighter.introduction')}
        </p>
      </div>

      {/* Why It Matters Section */}
      <div className="mb-12 rounded-lg border border-border bg-background/95 p-8 shadow-md">
        <h2 className="mb-6 text-3xl font-bold text-foreground text-center">
          Why It Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Illustration + Fun Aspect */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/personalise.png"
              alt="Creative"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">Creative Journey</h3>
            <p className="text-sm text-muted-foreground">
              Be part of a fun, global movement. Give lighters a second life with beautiful, hand-crafted stickers.
            </p>
          </div>

          {/* Illustration + Human Mosaic & Anti-Waste */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/telling_stories.png"
              alt="Community"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">Human Mosaic</h3>
            <p className="text-sm text-muted-foreground">
              Join thousands of LightSavers creating a human mosaic of stories and creativity while fighting waste.
            </p>
          </div>

          {/* Illustration + Sustainability */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/around_the_world.png"
              alt="Sustainable"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">Sustainable Impact</h3>
            <p className="text-sm text-muted-foreground">
              Our stickers are hand-made and sustainably manufactured. Help maintain this project alive.
            </p>
          </div>
        </div>
      </div>

      {/* Main Flow Component */}
      <SaveLighterFlow user={session.user} />
    </div>
  );
}