import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SaveLighterFlow from './SaveLighterFlow'; 
import { getI18n } from '@/locales/server';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function SaveLighterPage({ params }: { params: { locale: string } }) {
  const t = await getI18n() as any;
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${params.locale}/login?message=You must be logged in to save a lighter`);
  }

  
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          {t('save_lighter.title')}
        </h1>
        <p className="mb-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('save_lighter.introduction')}
        </p>
      </div>

      {}
      <div className="mb-12 rounded-lg border border-border bg-background/95 p-8 shadow-md">
        <h2 className="mb-6 text-2xl md:text-3xl font-bold text-foreground text-center">
          {t('save_lighter.why_it_matters')}
        </h2>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/personalise.png"
              alt="Creative"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">{t('save_lighter.creative_journey')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('save_lighter.creative_journey_desc')}
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/telling_stories.png"
              alt="Community"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">{t('save_lighter.human_mosaic')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('save_lighter.human_mosaic_desc')}
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Image
              src="/illustrations/around_the_world.png"
              alt="Sustainable"
              width={80}
              height={80}
              className="mb-4 w-20 h-20 object-contain"
            />
            <h3 className="font-semibold text-foreground mb-2">{t('save_lighter.sustainable_impact')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('save_lighter.sustainable_impact_desc')}
            </p>
          </div>
        </div>

        {/* Mobile: Alternating layout with bigger images on sides */}
        <div className="md:hidden space-y-6">
          {}
          <div className="flex gap-4 items-start">
            <Image
              src="/illustrations/personalise.png"
              alt="Creative"
              width={100}
              height={100}
              className="w-24 h-24 flex-shrink-0 object-contain"
            />
            <div>
              <h3 className="font-semibold text-foreground mb-1 text-base">{t('save_lighter.creative_journey')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('save_lighter.creative_journey_desc')}
              </p>
            </div>
          </div>

          {}
          <div className="flex gap-4 items-start flex-row-reverse">
            <Image
              src="/illustrations/telling_stories.png"
              alt="Community"
              width={100}
              height={100}
              className="w-24 h-24 flex-shrink-0 object-contain"
            />
            <div className="text-right">
              <h3 className="font-semibold text-foreground mb-1 text-base">{t('save_lighter.human_mosaic')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('save_lighter.human_mosaic_desc')}
              </p>
            </div>
          </div>

          {}
          <div className="flex gap-4 items-start">
            <Image
              src="/illustrations/around_the_world.png"
              alt="Sustainable"
              width={100}
              height={100}
              className="w-24 h-24 flex-shrink-0 object-contain"
            />
            <div>
              <h3 className="font-semibold text-foreground mb-1 text-base">{t('save_lighter.sustainable_impact')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('save_lighter.sustainable_impact_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {}
      <SaveLighterFlow user={session.user} />
    </div>
  );
}