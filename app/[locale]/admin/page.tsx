import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentLocale } from '@/locales/server';
import OrdersList from './OrdersList';
import ModeratorsManagement from './ModeratorsManagement';
import TestStickerGenerator from './TestStickerGenerator';
import EmailTester from './EmailTester';

export const dynamic = 'force-dynamic';

export default async function AdminPanelPage() {
  const locale = await getCurrentLocale();
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login?message=You must be logged in to access the admin panel.`);
  }

    const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    console.error('Admin access check failed:', { profileError, role: profile?.role });
    redirect(`/${locale}?message=Access denied. Admin privileges required.`);
  }

  
  const [ordersResult, moderatorsResult] = await Promise.all([
    supabase.rpc('admin_get_all_orders'),
    supabase.rpc('admin_get_moderators'),
  ]);

  const { data: orders, error: ordersError } = ordersResult;
  const { data: moderators, error: moderatorsError } = moderatorsResult;

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  if (moderatorsError) {
    console.error('Error fetching moderators:', moderatorsError);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage sticker orders, process refunds, and manage moderators</p>
      </div>

      {}
      <div className="mb-8 bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/${locale}/admin/testing`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            🧪 Testing Dashboard
          </a>
        </div>
      </div>

      {}
      <div className="mb-8">
        <EmailTester />
      </div>

      {}
      <div className="mb-8">
        <TestStickerGenerator />
      </div>

      {}
      <div className="mb-8">
        {moderatorsError ? (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
            <p className="text-sm font-medium">Error loading moderators: {moderatorsError.message}</p>
          </div>
        ) : (
          <ModeratorsManagement initialModerators={moderators || []} />
        )}
      </div>

      {}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Order Management</h2>
        {ordersError ? (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
            <p className="text-sm font-medium">Error loading orders: {ordersError.message}</p>
          </div>
        ) : (
          <OrdersList orders={orders || []} />
        )}
      </div>
    </div>
  );
}
