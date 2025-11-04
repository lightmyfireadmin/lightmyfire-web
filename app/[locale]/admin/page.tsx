import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentLocale } from '@/locales/server';
import OrdersList from './OrdersList';
import ModeratorsManagement from './ModeratorsManagement';

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

  
  const { data: userRole, error: roleError } = await supabase.rpc('get_my_role');

  if (roleError || userRole !== 'admin') {
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
