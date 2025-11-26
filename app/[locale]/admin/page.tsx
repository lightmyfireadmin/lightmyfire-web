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
    .single<{ role: 'admin' | 'moderator' | 'user' | null }>();

  if (profileError || profile?.role !== 'admin') {
    console.error('Admin access check failed:', { profileError, role: profile?.role });
    redirect(`/${locale}?message=Access denied. Admin privileges required.`);
  }

  const [ordersResult, moderatorsResult, statsResult] = await Promise.all([
    supabase.rpc('admin_get_all_orders'),
    supabase.rpc('admin_get_moderators'),
    supabase.rpc('admin_get_stats'),
  ]);

  const { data: orders, error: ordersError } = ordersResult;
  const { data: moderators, error: moderatorsError } = moderatorsResult;
  const { data: stats, error: statsError } = statsResult;

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  if (moderatorsError) {
    console.error('Error fetching moderators:', moderatorsError);
  }

  if (statsError) {
    console.error('Error fetching stats:', statsError);
  }

  const statsData = stats && stats.length > 0 ? stats[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage sticker orders, process refunds, and manage moderators</p>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-foreground">{statsData?.total_users ?? '-'}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Lighters</h3>
            <p className="text-3xl font-bold text-foreground">{statsData?.active_lighters ?? '-'}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</h3>
             <p className="text-3xl font-bold text-green-600">
                {statsData?.total_revenue_cents ? `€${(statsData.total_revenue_cents / 100).toFixed(2)}` : '-'}
            </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center text-center">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Orders</h3>
             <p className="text-3xl font-bold text-yellow-600">{statsData?.pending_orders ?? '-'}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/${locale}/admin/email-tool`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            📧 Email Management Tool
          </a>
          <a
            href={`/${locale}/admin/testing`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            🧪 Testing Dashboard
          </a>
        </div>
      </div>

      {/* Email Tester */}
      <div className="mb-8">
        <EmailTester />
      </div>

      {/* Sticker Generator */}
      <div className="mb-8">
        <TestStickerGenerator />
      </div>

      {/* Moderators */}
      <div className="mb-8">
        {moderatorsError ? (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
            <p className="text-sm font-medium">Error loading moderators: {moderatorsError.message}</p>
          </div>
        ) : (
          <ModeratorsManagement initialModerators={moderators || []} />
        )}
      </div>

      {/* Orders */}
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
