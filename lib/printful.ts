

const PRINTFUL_API_BASE = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  PRINTFUL_API_KEY not configured. Order fulfillment disabled.');
}

if (!PRINTFUL_STORE_ID && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  PRINTFUL_STORE_ID not configured. Some API endpoints may fail.');
}

class PrintfulClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || PRINTFUL_API_KEY || '';
    this.baseUrl = PRINTFUL_API_BASE;
  }

  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new PrintfulError(
        error.error?.message || `Printful API error: ${response.statusText}`,
        response.status,
        error
      );
    }

    const data = await response.json();
    return data.result as T;
  }

  
  async getProduct(productId: number) {
    return this.request<PrintfulProduct>(`/products/${productId}`);
  }

  
  async getVariant(variantId: number) {
    return this.request<PrintfulVariant>(`/products/variant/${variantId}`);
  }

  
  async calculateShipping(order: PrintfulShippingRequest) {
        const requestBody = PRINTFUL_STORE_ID
      ? { ...order, store_id: parseInt(PRINTFUL_STORE_ID, 10) }
      : order;

    return this.request<PrintfulShippingRates>('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  
  async createOrder(order: PrintfulOrderRequest) {
    return this.request<PrintfulOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  
  async confirmOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  }

  
  async getOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}`);
  }

  
  async cancelOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  
  async getOrders(params?: {
    status?: 'draft' | 'pending' | 'fulfilled' | 'canceled';
    offset?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.offset) searchParams.append('offset', String(params.offset));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const query = searchParams.toString();
    return this.request<PrintfulOrder[]>(`/orders${query ? `?${query}` : ''}`);
  }

  
  async getStoreInfo() {
    return this.request<PrintfulStore>('/store');
  }
}

export class PrintfulError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PrintfulError';
  }
}

export interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  title: string;
  brand: string | null;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  files: PrintfulFile[];
  options: PrintfulOption[];
}

export interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  image: string;
  price: string;
  in_stock: boolean;
  availability_status: string;
  files: PrintfulFile[];
}

export interface PrintfulFile {
  id: number;
  type: string;
  title: string;
  additional_price: string | null;
}

export interface PrintfulOption {
  id: string;
  value: string;
  additional_price: string | null;
}

export interface PrintfulShippingRequest {
  recipient: {
    address1: string;
    city: string;
    country_code: string;
    state_code?: string;
    zip: string;
  };
  items: Array<{
    variant_id: number;
    quantity: number;
  }>;
  currency?: string;
  locale?: string;
}

export interface PrintfulShippingRates {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
}

export interface PrintfulOrderRequest {
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code?: string;
    country_code: string;
    zip: string;
    phone?: string;
    email: string;
  };
  items: Array<{
    variant_id: number;
    quantity: number;
    files?: Array<{
      url: string;
      type?: 'front' | 'back' | 'left' | 'right';
    }>;
    options?: Array<{
      id: string;
      value: string;
    }>;
  }>;
  retail_costs?: {
    currency: string;
    subtotal: string;
    discount?: string;
    shipping: string;
    tax?: string;
  };
  shipping?: string;
  packing_slip?: {
    email?: string;
    phone?: string;
    message?: string;
    logo_url?: string;
  };
}

export interface PrintfulOrder {
  id: number;
  external_id: string;
  store: number;
  status: 'draft' | 'pending' | 'fulfilled' | 'canceled' | 'failed';
  shipping: string;
  shipping_service_name: string;
  created: number;
  updated: number;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  costs: PrintfulCosts;
  retail_costs: PrintfulRetailCosts;
  shipments: PrintfulShipment[];
}

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  state_name?: string;
  country_code: string;
  country_name: string;
  zip: string;
  phone?: string;
  email: string;
}

export interface PrintfulOrderItem {
  id: number;
  external_id?: string;
  variant_id: number;
  sync_variant_id?: number;
  external_variant_id?: string;
  quantity: number;
  price: string;
  retail_price?: string;
  name: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: Array<{
    id: number;
    type: string;
    hash?: string;
    url?: string;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi?: number;
    status: string;
    created: number;
    thumbnail_url?: string;
    preview_url?: string;
    visible: boolean;
  }>;
  options: PrintfulOption[];
  sku: string | null;
}

export interface PrintfulCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  digitization: string;
  additional_fee: string;
  fulfillment_fee: string;
  tax: string;
  vat: string;
  total: string;
}

export interface PrintfulRetailCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  vat: string;
  total: string;
}

export interface PrintfulShipment {
  id: number;
  carrier: string;
  service: string;
  tracking_number: string;
  tracking_url: string;
  created: number;
  ship_date: string;
  shipped_at: number;
  reshipment: boolean;
  items: Array<{
    item_id: number;
    quantity: number;
    picked: number;
    printed: number;
  }>;
}

export interface PrintfulStore {
  id: number;
  name: string;
  type: string;
  website: string | null;
  currency: string;
  created: number;
}

export const LIGHTMYFIRE_PRINTFUL_CONFIG = {
    STICKER_SHEET_VARIANT_ID: 9413,

    DEFAULT_SHIPPING: 'STANDARD',

    PACKING_SLIP: {
    logo_url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo-printful.png`,
    message: `Thank you for being a LightSaver!

Your custom stickers are ready to start their journey. Here's how to use them:

1. Peel & Stick: Apply stickers to your lighters
2. Share: Give them to friends or "lose" them in fun places
3. Follow: Watch their stories grow at lightmyfire.app

Questions? Email us at support@lightmyfire.app

Keep the flame alive! 🔥
The LightMyFire Team`,
  },

    FILE_SETTINGS: {
    type: 'back' as const,     required_dpi: 600,
    max_file_size_mb: 50,
  },
};

export async function createStickerOrder(params: {
  orderId: string;   packSize: 10 | 20 | 50;
  stickerPdfUrl: string;   customer: {
    name: string;
    email: string;
    address1: string;
    address2?: string;
    city: string;
    stateCode?: string;
    countryCode: string;
    zip: string;
    phone?: string;
  };
  retailCosts: {
    subtotal: number;     shipping: number;     tax?: number;   };
  backgroundTheme?: string;
}) {
  const client = new PrintfulClient();

    const orderRequest: PrintfulOrderRequest = {
    recipient: {
      name: params.customer.name,
      email: params.customer.email,
      address1: params.customer.address1,
      address2: params.customer.address2,
      city: params.customer.city,
      state_code: params.customer.stateCode,
      country_code: params.customer.countryCode,
      zip: params.customer.zip,
      phone: params.customer.phone,
    },
    items: [
      {
        variant_id: LIGHTMYFIRE_PRINTFUL_CONFIG.STICKER_SHEET_VARIANT_ID,
        quantity: Math.ceil(params.packSize / 10),         files: [
          {
            url: params.stickerPdfUrl,
            type: 'back',
          },
        ],
        options: [
          {
            id: 'stitch_color',
            value: '#FFFFFF',           },
        ],
      },
    ],
    retail_costs: {
      currency: 'EUR',
      subtotal: (params.retailCosts.subtotal / 100).toFixed(2),
      shipping: (params.retailCosts.shipping / 100).toFixed(2),
      tax: params.retailCosts.tax
        ? (params.retailCosts.tax / 100).toFixed(2)
        : undefined,
    },
    shipping: LIGHTMYFIRE_PRINTFUL_CONFIG.DEFAULT_SHIPPING,
    packing_slip: {
      email: 'support@lightmyfire.app',
      ...LIGHTMYFIRE_PRINTFUL_CONFIG.PACKING_SLIP,
    },
  };

  try {
        const order = await client.createOrder(orderRequest);

        const confirmedOrder = await client.confirmOrder(order.id);

    return {
      success: true,
      printfulOrderId: confirmedOrder.id,
      status: confirmedOrder.status,
      tracking: confirmedOrder.shipments[0]?.tracking_number || null,
      estimatedDelivery: {
        min: 5,         max: 10,       },
    };
  } catch (error) {
    if (error instanceof PrintfulError) {
      console.error('Printful order creation failed:', {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      });

      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    throw error;
  }
}

export async function getPrintfulOrderStatus(printfulOrderId: number) {
  const client = new PrintfulClient();

  try {
    const order = await client.getOrder(printfulOrderId);

    return {
      status: order.status,
      shipping: {
        carrier: order.shipments[0]?.carrier || null,
        trackingNumber: order.shipments[0]?.tracking_number || null,
        trackingUrl: order.shipments[0]?.tracking_url || null,
        shipDate: order.shipments[0]?.ship_date || null,
      },
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        status: item.files[0]?.status || 'pending',
      })),
    };
  } catch (error) {
    if (error instanceof PrintfulError) {
      console.error('Failed to get Printful order status:', error.message);
      return null;
    }
    throw error;
  }
}

export async function cancelPrintfulOrder(printfulOrderId: number) {
  const client = new PrintfulClient();

  try {
    await client.cancelOrder(printfulOrderId);
    return { success: true };
  } catch (error) {
    if (error instanceof PrintfulError) {
      console.error('Failed to cancel Printful order:', error.message);
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export function verifyPrintfulWebhook(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('PRINTFUL_WEBHOOK_SECRET not configured');
    return false;
  }

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hmac === signature;
}

export const printful = new PrintfulClient();

export default printful;
