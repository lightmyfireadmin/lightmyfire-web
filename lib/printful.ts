import { logger } from './logger';

const PRINTFUL_API_BASE = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  PRINTFUL_API_KEY not configured. Order fulfillment disabled.');
}

if (!PRINTFUL_STORE_ID && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  PRINTFUL_STORE_ID not configured. Some API endpoints may fail.');
}

/**
 * Retry configuration for Printful API calls
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Determines if an error is retryable (transient/network issues vs permanent errors)
 *
 * @param {number} [statusCode] - The HTTP status code of the error.
 * @returns {boolean} True if retryable, false otherwise.
 */
function isRetryableError(statusCode?: number): boolean {
  if (!statusCode) return true; // Network errors are retryable

  // 429 Too Many Requests - rate limiting, should retry
  // 500-599 Server errors - transient issues, should retry
  // 408 Request Timeout - should retry
  return statusCode === 429 || statusCode === 408 || (statusCode >= 500 && statusCode < 600);
}

/**
 * Sleep for specified milliseconds
 *
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param {() => Promise<T>} fn - The async function to retry.
 * @param {string} context - Context description for logging.
 * @param {number} [maxRetries=RETRY_CONFIG.maxRetries] - Maximum number of retries.
 * @returns {Promise<T>} The result of the function.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const statusCode = error instanceof PrintfulError ? error.statusCode : undefined;
      const isRetryable = isRetryableError(statusCode);

      // If not retryable or last attempt, throw immediately
      if (!isRetryable || attempt === maxRetries) {
        console.error(`${context} failed after ${attempt + 1} attempts (not retryable or max retries reached)`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          statusCode,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
        RETRY_CONFIG.maxDelay
      );

      console.warn(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode,
        attemptsRemaining: maxRetries - attempt,
      });

      await sleep(delay);
    }
  }

  // Should never reach here due to throw in loop, but TypeScript needs this
  throw lastError || new Error(`${context} failed after retries`);
}

/**
 * A client wrapper for the Printful API.
 * Handles authentication and basic CRUD operations for orders, products, and variants.
 */
class PrintfulClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates an instance of PrintfulClient.
   *
   * @param {string} [apiKey] - The Printful API key. Defaults to process.env.PRINTFUL_API_KEY.
   */
  constructor(apiKey?: string) {
    this.apiKey = apiKey || PRINTFUL_API_KEY || '';
    this.baseUrl = PRINTFUL_API_BASE;
  }

  /**
   * Generic request handler for Printful API.
   *
   * @template T
   * @param {string} endpoint - The API endpoint path (e.g., '/orders').
   * @param {RequestInit} [options={}] - Standard fetch options.
   * @returns {Promise<T>} The parsed JSON response data (the 'result' field of the Printful response).
   * @throws {PrintfulError} If the API returns a non-200 status code.
   */
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

  /**
   * Retrieves product details by ID.
   *
   * @param {number} productId - The unique identifier of the product.
   * @returns {Promise<PrintfulProduct>} The product details.
   */
  async getProduct(productId: number) {
    return this.request<PrintfulProduct>(`/products/${productId}`);
  }

  /**
   * Retrieves variant details by ID.
   *
   * @param {number} variantId - The unique identifier of the variant.
   * @returns {Promise<PrintfulVariant>} The variant details.
   */
  async getVariant(variantId: number) {
    return this.request<PrintfulVariant>(`/products/variant/${variantId}`);
  }

  /**
   * Calculates shipping rates for a potential order.
   *
   * @param {PrintfulShippingRequest} order - The shipping request details including items and recipient.
   * @returns {Promise<PrintfulShippingRates>} A list of available shipping rates.
   */
  async calculateShipping(order: PrintfulShippingRequest) {
    const requestBody = PRINTFUL_STORE_ID
      ? { ...order, store_id: parseInt(PRINTFUL_STORE_ID, 10) }
      : order;

    return this.request<PrintfulShippingRates>('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Creates a new order in Printful.
   *
   * @param {PrintfulOrderRequest} order - The order details.
   * @returns {Promise<PrintfulOrder>} The created order object.
   */
  async createOrder(order: PrintfulOrderRequest) {
    return this.request<PrintfulOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  /**
   * Confirms a draft order, triggering fulfillment.
   *
   * @param {string | number} orderId - The Printful order ID to confirm.
   * @returns {Promise<PrintfulOrder>} The confirmed order object.
   */
  async confirmOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  }

  /**
   * Retrieves details of an existing order.
   *
   * @param {string | number} orderId - The Printful order ID.
   * @returns {Promise<PrintfulOrder>} The order details.
   */
  async getOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}`);
  }

  /**
   * Cancels a pending order.
   *
   * @param {string | number} orderId - The Printful order ID to cancel.
   * @returns {Promise<PrintfulOrder>} The cancelled order details.
   */
  async cancelOrder(orderId: string | number) {
    return this.request<PrintfulOrder>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Lists orders with optional filtering and pagination.
   *
   * @param {object} [params] - Filter parameters.
   * @param {string} [params.status] - Filter by order status ('draft', 'pending', 'fulfilled', 'canceled').
   * @param {number} [params.offset] - Pagination offset (number of items to skip).
   * @param {number} [params.limit] - Pagination limit (number of items to return).
   * @returns {Promise<PrintfulOrder[]>} A list of orders matching the criteria.
   */
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

  /**
   * Retrieves information about the Printful store.
   *
   * @returns {Promise<PrintfulStore>} The store information.
   */
  async getStoreInfo() {
    return this.request<PrintfulStore>('/store');
  }
}

/**
 * Custom error class for Printful API errors.
 */
export class PrintfulError extends Error {
  /**
   * Creates an instance of PrintfulError.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code returned by the API.
   * @param {unknown} [details] - Additional error details from the response body.
   */
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PrintfulError';
  }
}

// Type definitions for Printful API objects
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

export interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
}

export type PrintfulShippingRates = PrintfulShippingRate[];

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

/**
 * Configuration for Printful integration specific to LightMyFire.
 */
export const LIGHTMYFIRE_PRINTFUL_CONFIG = {
  // Use a standard sticker sheet or custom product ID from your Printful store
  STICKER_SHEET_VARIANT_ID: 9413, // Example ID, needs to be replaced with actual product ID

  DEFAULT_SHIPPING: 'STANDARD',

  PACKING_SLIP: {
    logo_url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-printful.png`,
    message: `Thank you for being a LightSaver!

Your custom stickers are ready to start their journey. Here's how to use them:

1. Peel & Stick: Apply stickers to your lighters
2. Share: Give them to friends or "lose" them in fun places
3. Follow: Watch their stories grow at lightmyfire.app

Questions? Email us at support@lightmyfire.app

Keep the flame alive! 🔥
The LightMyFire Team`,
  },

  // File requirements for print quality
  FILE_SETTINGS: {
    type: 'back' as const, // Printful usually uses 'front', 'back', etc.
    required_dpi: 600,
    max_file_size_mb: 50,
  },
};

/**
 * Creates a sticker order in Printful, handling draft creation and confirmation.
 *
 * @param {object} params - The order parameters.
 * @param {string} params.orderId - The application's internal order ID.
 * @param {10 | 20 | 50} params.packSize - The size of the sticker pack (determines quantity).
 * @param {string} params.stickerPdfUrl - The URL of the generated sticker sheet file (PDF/PNG).
 * @param {object} params.customer - Customer shipping and contact details.
 * @param {object} params.retailCosts - Retail cost breakdown for customs/invoicing.
 * @param {string} [params.backgroundTheme] - Optional background theme identifier.
 * @returns {Promise<object>} The result of the order creation, including Printful order ID and status.
 */
export async function createStickerOrder(params: {
  orderId: string; // Our internal order ID
  packSize: 10 | 20 | 50;
  stickerPdfUrl: string; // URL to the generated PDF
  customer: {
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
    subtotal: number; // in cents
    shipping: number; // in cents
    tax?: number; // in cents
  };
  backgroundTheme?: string;
}) {
  const client = new PrintfulClient();

  // Map our internal data to Printful order format
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
        quantity: Math.ceil(params.packSize / 10), // Assuming 1 sheet = 10 stickers
        files: [
          {
            url: params.stickerPdfUrl,
            type: 'back',
          },
        ],
        options: [
          {
            id: 'stitch_color',
            value: '#FFFFFF', // Default option example
          },
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
    // Create draft order with retry logic for transient failures
    const order = await retryWithBackoff(
      () => client.createOrder(orderRequest),
      'Printful createOrder'
    );

    logger.info('Printful draft order created successfully', {
      orderId: order.id,
      status: order.status,
    });

    // Confirm order with retry logic (confirming triggers fulfillment)
    const confirmedOrder = await retryWithBackoff(
      () => client.confirmOrder(order.id),
      'Printful confirmOrder'
    );

    logger.info('Printful order confirmed successfully', {
      orderId: confirmedOrder.id,
      status: confirmedOrder.status,
    });

    return {
      success: true,
      printfulOrderId: confirmedOrder.id,
      status: confirmedOrder.status,
      tracking: confirmedOrder.shipments[0]?.tracking_number || null,
      estimatedDelivery: {
        min: 5,
        max: 10,
      },
    };
  } catch (error) {
    if (error instanceof PrintfulError) {
      // Provide detailed error messages based on status code
      let userFriendlyMessage = error.message;
      let technicalDetails = '';

      switch (error.statusCode) {
        case 400:
          userFriendlyMessage = 'Invalid order data. Please check the sticker file and shipping address.';
          technicalDetails = 'Bad Request - verify PDF file format, dimensions, and shipping address format';
          break;
        case 401:
          userFriendlyMessage = 'Printful authentication failed. Please contact support.';
          technicalDetails = 'Unauthorized - check PRINTFUL_API_KEY configuration';
          break;
        case 403:
          userFriendlyMessage = 'Access denied to Printful API. Please contact support.';
          technicalDetails = 'Forbidden - API key may lack required permissions';
          break;
        case 404:
          userFriendlyMessage = 'Printful resource not found. Please contact support.';
          technicalDetails = 'Not Found - product variant or store ID may be invalid';
          break;
        case 429:
          userFriendlyMessage = 'Too many requests to Printful. Please try again in a few minutes.';
          technicalDetails = 'Rate Limited - retry logic failed, temporary backoff required';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userFriendlyMessage = 'Printful service temporarily unavailable. Your order has been saved and will be retried automatically.';
          technicalDetails = `Printful server error (${error.statusCode}) - order should be retried from queue`;
          break;
        default:
          userFriendlyMessage = 'Failed to create Printful order. Please contact support.';
          technicalDetails = `Unexpected error code: ${error.statusCode}`;
      }

      console.error('Printful order creation failed after retries:', {
        message: error.message,
        userFriendlyMessage,
        technicalDetails,
        statusCode: error.statusCode,
        details: error.details,
        orderId: params.orderId,
        packSize: params.packSize,
      });

      return {
        success: false,
        error: userFriendlyMessage,
        statusCode: error.statusCode,
        technicalDetails,
      };
    }

    // Network or other unexpected errors
    console.error('Unexpected error during Printful order creation:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      orderId: params.orderId,
      packSize: params.packSize,
    });

    return {
      success: false,
      error: 'An unexpected error occurred while processing your order. Please contact support.',
      technicalDetails: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retrieves the status and shipping details of a Printful order.
 *
 * @param {number} printfulOrderId - The ID of the order in Printful.
 * @returns {Promise<object | null>} An object containing status and shipping info, or null if the request fails after retries.
 */
export async function getPrintfulOrderStatus(printfulOrderId: number) {
  const client = new PrintfulClient();

  try {
    // Retry order status fetching for transient failures
    const order = await retryWithBackoff(
      () => client.getOrder(printfulOrderId),
      `Printful getOrder(${printfulOrderId})`
    );

    logger.info('Printful order status retrieved successfully', {
      orderId: printfulOrderId,
      status: order.status,
    });

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
      console.error('Failed to get Printful order status after retries:', {
        orderId: printfulOrderId,
        error: error.message,
        statusCode: error.statusCode,
      });
      return null;
    }

    console.error('Unexpected error fetching Printful order status:', {
      orderId: printfulOrderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Cancels an existing Printful order.
 *
 * @param {number} printfulOrderId - The ID of the order to cancel.
 * @returns {Promise<object>} An object indicating success or failure, with error details if applicable.
 */
export async function cancelPrintfulOrder(printfulOrderId: number) {
  const client = new PrintfulClient();

  try {
    // Retry cancel operation for transient failures
    await retryWithBackoff(
      () => client.cancelOrder(printfulOrderId),
      `Printful cancelOrder(${printfulOrderId})`
    );

    logger.info('Printful order cancelled successfully', { orderId: printfulOrderId });
    return { success: true };
  } catch (error) {
    if (error instanceof PrintfulError) {
      let errorMessage = error.message;

      // Provide better error messages for common cancellation failures
      switch (error.statusCode) {
        case 404:
          errorMessage = 'Order not found or already cancelled';
          break;
        case 409:
          errorMessage = 'Order cannot be cancelled - it may already be in production or fulfilled';
          break;
        case 403:
          errorMessage = 'Access denied - order may belong to a different store';
          break;
      }

      console.error('Failed to cancel Printful order after retries:', {
        orderId: printfulOrderId,
        error: error.message,
        userFriendlyMessage: errorMessage,
        statusCode: error.statusCode,
      });

      return { success: false, error: errorMessage, statusCode: error.statusCode };
    }

    console.error('Unexpected error cancelling Printful order:', {
      orderId: printfulOrderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifies the integrity of a Printful webhook using HMAC-SHA256 signature validation.
 *
 * @param {string} payload - The raw JSON body of the webhook request.
 * @param {string} signature - The signature provided in the X-Printful-Signature header.
 * @returns {boolean} True if the signature matches the payload and secret, false otherwise.
 */
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

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    // Signature is invalid format (different length)
    return false;
  }
}

/** Global instance of PrintfulClient. */
export const printful = new PrintfulClient();

export default printful;
