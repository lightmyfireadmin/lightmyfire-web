'use client';

import { useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Order {
  id: string;
  user_id: string;
  user_email: string | null;
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  pack_size: number;
  status: string;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  refund_status: string | null;
  refund_amount_cents: number | null;
  refunded_at: string | null;
  created_at: string;
}

interface OrdersListProps {
  orders: Order[];
}

export default function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);

  const handleResendFulfillment = async (order: Order) => {
    if (!confirm(`Resend fulfillment email with stickers for order ${order.id.substring(0, 8)}...?`)) {
      return;
    }

    setResendingOrderId(order.id);

    try {
      const response = await fetch('/api/admin/resend-fulfillment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend fulfillment email');
      }

      const result = await response.json();
      alert(`✅ Fulfillment email resent successfully!\n\n${result.lighterCount} sticker(s) sent to fulfillment team.`);
    } catch (error) {
      console.error('Resend fulfillment error:', error);
      alert(`❌ Failed to resend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setResendingOrderId(null);
    }
  };

  const handleRefund = async (order: Order) => {
    if (!confirm(`Are you sure you want to refund €${(order.amount_cents / 100).toFixed(2)} to ${order.shipping_email}?`)) {
      return;
    }

    setRefundingOrderId(order.id);

    try {
      const response = await fetch('/api/admin/refund-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentIntentId: order.stripe_payment_intent_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Refund failed');
      }

      const { refund } = await response.json();

      
      setOrders(orders.map(o =>
        o.id === order.id
          ? {
              ...o,
              refund_status: 'refunded',
              refund_amount_cents: refund.amount,
              refunded_at: new Date().toISOString(),
            }
          : o
      ));

      alert(`Refund successful! Amount: €${(refund.amount / 100).toFixed(2)}`);
    } catch (error) {
      console.error('Refund error:', error);
      alert(`Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefundingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (cents: number, currency: string) => {
    const symbol = currency === 'eur' ? '€' : '$';
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-200',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRefundStatusBadge = (refundStatus: string | null) => {
    if (!refundStatus) return null;

    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${statusColors[refundStatus] || statusColors.pending}`}>
        {refundStatus.toUpperCase()}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(
              orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount_cents, 0),
              'eur'
            )}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Refunded</p>
          <p className="text-2xl font-bold text-red-600">
            {formatAmount(
              orders.filter(o => o.refund_status === 'refunded').reduce((sum, o) => sum + (o.refund_amount_cents || 0), 0),
              'eur'
            )}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Pending Refunds</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.refund_status === 'pending').length}
          </p>
        </div>
      </div>

      {}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pack Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {orders.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="text-sm font-mono text-primary hover:underline"
                      >
                        {order.id.substring(0, 8)}...
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{order.shipping_name}</div>
                      <div className="text-xs text-muted-foreground">{order.shipping_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {order.pack_size} stickers
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      {formatAmount(order.amount_cents, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                      {getRefundStatusBadge(order.refund_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-2">
                        {}
                        {order.status === 'paid' && (
                          <button
                            onClick={() => handleResendFulfillment(order)}
                            disabled={resendingOrderId === order.id}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-primary rounded-md text-xs font-medium text-primary bg-white dark:bg-gray-800 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendingOrderId === order.id ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Sending...</span>
                              </>
                            ) : (
                              '📧 Send to Fulfillment'
                            )}
                          </button>
                        )}

                        {}
                        {order.status === 'paid' && order.refund_status !== 'refunded' ? (
                          <button
                            onClick={() => handleRefund(order)}
                            disabled={refundingOrderId === order.id}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-red-300 dark:border-red-700 rounded-md text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {refundingOrderId === order.id ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Refunding...</span>
                              </>
                            ) : (
                              'Refund'
                            )}
                          </button>
                        ) : order.refund_status === 'refunded' ? (
                          <span className="text-xs text-muted-foreground">
                            Refunded {order.refunded_at ? formatDate(order.refunded_at) : ''}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr key={`${order.id}-details`}>
                      <td colSpan={7} className="px-6 py-4 bg-muted/10">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-foreground mb-2">Order Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Full Order ID</p>
                              <p className="text-xs font-mono text-foreground">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Payment Intent ID</p>
                              <p className="text-xs font-mono text-foreground">{order.stripe_payment_intent_id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">User Email</p>
                              <p className="text-xs text-foreground">{order.user_email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Shipping Address</p>
                              <p className="text-xs text-foreground">
                                {order.shipping_address}, {order.shipping_city}, {order.shipping_postal_code}, {order.shipping_country}
                              </p>
                            </div>
                          </div>
                          {order.refund_status === 'refunded' && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground">Refund Information</p>
                              <p className="text-xs text-foreground">
                                Amount: {formatAmount(order.refund_amount_cents || 0, order.currency)} •
                                Date: {order.refunded_at ? formatDate(order.refunded_at) : 'N/A'}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
