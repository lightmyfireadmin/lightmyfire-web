'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/locales/client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Order {
  id: string;
  orderId: string;
  status: string;
  quantity: number;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  lighterNames: string[];
  printfulOrderId?: number;
  onHold: boolean;
  holdReason?: string;
  failureReason?: string;
  cancellationReason?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  updatedAt: string;
}

export default function MyOrdersPage() {
  const t = useI18n() as any;
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthAndFetchOrders = useCallback(async () => {
    try {
            const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

            const response = await fetch('/api/my-orders');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        // Parse error from response if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      // Set orders even if empty array - this will trigger the empty state UI
      setOrders(data.orders || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      // Set empty orders array on error so user can still see the page
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, [checkAuthAndFetchOrders]);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'shipped':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'delivered':
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      case 'failed':
      case 'returned':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'canceled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '✅';
      case 'failed':
        return '❌';
      case 'canceled':
        return '🚫';
      case 'returned':
        return '↩️';
      default:
        return '📋';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('my_orders.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('my_orders.subtitle')}
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  {t('my_orders.error.title')}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('my_orders.error.description', { error })}
                </p>
                <button
                  onClick={checkAuthAndFetchOrders}
                  className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                >
                  {t('my_orders.error.try_again')}
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t('my_orders.no_orders')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('my_orders.no_orders_text')}
            </p>
            <button
              onClick={() => router.push('/save-lighter')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
            >
              {t('my_orders.order_stickers')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {t('my_orders.order_id', { orderId: order.orderId })}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {t(`my_orders.status.${order.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('my_orders.placed_on', { date: formatDate(order.createdAt) })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity === 1
                        ? t('my_orders.sticker_count', { count: order.quantity })
                        : t('my_orders.stickers_count', { count: order.quantity })
                      }
                    </p>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      📍 {t('my_orders.shipping.title')}
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.customerName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {}
                  {order.lighterNames && order.lighterNames.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        🏷️ {t('my_orders.lighters.title')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {order.lighterNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {}
                {order.trackingNumber && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      🚚 {t('my_orders.tracking.title')}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('my_orders.tracking.carrier')}
                        </span>
                        <span className="text-sm text-foreground font-semibold">
                          {order.carrier}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('my_orders.tracking.number')}
                        </span>
                        <span className="text-sm font-mono text-foreground">
                          {order.trackingNumber}
                        </span>
                      </div>
                      {order.shippedAt && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t('my_orders.tracking.shipped')}
                          </span>
                          <span className="text-sm text-foreground">
                            {formatDate(order.shippedAt)}
                          </span>
                        </div>
                      )}
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          {t('my_orders.tracking.track_button')}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {}
                {order.onHold && order.holdReason && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      ⚠️ {t('my_orders.hold.title')}
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {order.holdReason}
                    </p>
                  </div>
                )}

                {order.failureReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      ❌ {t('my_orders.failed.title')}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {order.failureReason}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {t('my_orders.failed.contact')}{' '}
                      <a
                        href="mailto:support@lightmyfire.app"
                        className="underline font-medium"
                      >
                        support@lightmyfire.app
                      </a>
                    </p>
                  </div>
                )}

                {order.cancellationReason && (
                  <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      🚫 {t('my_orders.canceled.title')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.cancellationReason}
                    </p>
                  </div>
                )}

                {}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t('my_orders.help.label')}{' '}
                    <a
                      href={`mailto:support@lightmyfire.app?subject=Order ${order.orderId}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {t('my_orders.help.contact')}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
