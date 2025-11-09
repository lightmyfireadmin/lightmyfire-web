'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  quantity: number;
  amount_paid: number;
  lighter_names: string[];
  stripe_payment_intent_id: string;
}

interface Lighter {
  id: string;
  lighter_name: string;
  pin_code: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  lighters: {
    id: string;
    lighter_name: string;
  };
}

interface AttachmentSelectorProps {
  userId: string | null;
  onSelectOrder: (order: Order | null) => void;
  onSelectLighter: (lighter: Lighter | null) => void;
  onSelectPost: (post: Post | null) => void;
  selectedOrder: Order | null;
  selectedLighter: Lighter | null;
  selectedPost: Post | null;
}

export default function AttachmentSelector({
  userId,
  onSelectOrder,
  onSelectLighter,
  onSelectPost,
  selectedOrder,
  selectedLighter,
  selectedPost,
}: AttachmentSelectorProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lighters, setLighters] = useState<Lighter[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingLighters, setIsLoadingLighters] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Fetch user data when userId changes
  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLighters([]);
      setPosts([]);
      onSelectOrder(null);
      onSelectLighter(null);
      onSelectPost(null);
      return;
    }

    // Fetch orders
    setIsLoadingOrders(true);
    fetch(`/api/admin/email-tool/user-orders?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(err => console.error('Error fetching orders:', err))
      .finally(() => setIsLoadingOrders(false));

    // Fetch lighters
    setIsLoadingLighters(true);
    fetch(`/api/admin/email-tool/user-lighters?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.lighters) {
          setLighters(data.lighters);
        }
      })
      .catch(err => console.error('Error fetching lighters:', err))
      .finally(() => setIsLoadingLighters(false));

    // Fetch posts
    setIsLoadingPosts(true);
    fetch(`/api/admin/email-tool/user-posts?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error('Error fetching posts:', err))
      .finally(() => setIsLoadingPosts(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-md border border-border">
        <p className="text-sm text-muted-foreground">
          Select a recipient to view their orders, lighters, and posts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Dynamic Content Attachments</h3>

      {/* Orders */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Attach Order (Optional)
        </label>
        {isLoadingOrders ? (
          <div className="text-sm text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No orders found for this user</div>
        ) : (
          <select
            value={selectedOrder?.id || ''}
            onChange={(e) => {
              const order = orders.find(o => o.id === e.target.value);
              onSelectOrder(order || null);
            }}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">-- No order --</option>
            {orders.map((order) => {
              const orderNum = order.stripe_payment_intent_id?.slice(-6) || order.id.slice(0, 6);
              return (
                <option key={order.id} value={order.id}>
                  Order #{orderNum} - {order.quantity} sticker{order.quantity > 1 ? 's' : ''} - €{(order.amount_paid / 100).toFixed(2)}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Lighters */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Attach Lighter (Optional)
        </label>
        {isLoadingLighters ? (
          <div className="text-sm text-muted-foreground">Loading lighters...</div>
        ) : lighters.length === 0 ? (
          <div className="text-sm text-muted-foreground">No lighters found for this user</div>
        ) : (
          <select
            value={selectedLighter?.id || ''}
            onChange={(e) => {
              const lighter = lighters.find(l => l.id === e.target.value);
              onSelectLighter(lighter || null);
            }}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">-- No lighter --</option>
            {lighters.map((lighter) => (
              <option key={lighter.id} value={lighter.id}>
                {lighter.lighter_name} (PIN: {lighter.pin_code})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Posts */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Attach Post (Optional)
        </label>
        {isLoadingPosts ? (
          <div className="text-sm text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts found for this user</div>
        ) : (
          <select
            value={selectedPost?.id || ''}
            onChange={(e) => {
              const post = posts.find(p => p.id === e.target.value);
              onSelectPost(post || null);
            }}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">-- No post --</option>
            {posts.map((post) => {
              const preview = post.content.slice(0, 50) + (post.content.length > 50 ? '...' : '');
              return (
                <option key={post.id} value={post.id}>
                  {preview} - on {post.lighters?.lighter_name || 'Unknown Lighter'}
                </option>
              );
            })}
          </select>
        )}
      </div>
    </div>
  );
}
