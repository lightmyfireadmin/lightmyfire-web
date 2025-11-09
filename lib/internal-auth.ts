import crypto from 'crypto';

/**
 * Generates a secure internal authentication token using HMAC-SHA256
 * @param userId - The user ID to authenticate
 * @returns Base64-encoded token with payload and signature
 */
export function generateInternalAuthToken(userId: string): string {
  const secret = process.env.INTERNAL_AUTH_SECRET;

  if (!secret) {
    throw new Error('INTERNAL_AUTH_SECRET environment variable is not configured');
  }

  const timestamp = Date.now();
  const payload = JSON.stringify({ userId, timestamp });

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Combine payload and signature
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');

  return token;
}

/**
 * Verifies an internal authentication token
 * @param token - Base64-encoded token to verify
 * @param expectedUserId - Expected user ID
 * @param maxAgeMs - Maximum age of token in milliseconds (default: 60000ms = 1 minute)
 * @returns true if token is valid, false otherwise
 */
export function verifyInternalAuthToken(
  token: string,
  expectedUserId: string,
  maxAgeMs: number = 60000
): boolean {
  try {
    const secret = process.env.INTERNAL_AUTH_SECRET;

    if (!secret) {
      console.error('INTERNAL_AUTH_SECRET environment variable is not configured');
      return false;
    }

    // Decode the token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, receivedSignature] = decoded.split(':');

    if (!payloadStr || !receivedSignature) {
      console.error('Invalid token format');
      return false;
    }

    // Parse payload
    const payload = JSON.parse(payloadStr);
    const { userId, timestamp } = payload;

    // Verify user ID matches
    if (userId !== expectedUserId) {
      console.error('User ID mismatch');
      return false;
    }

    // Verify timestamp is recent
    const age = Date.now() - timestamp;
    if (age > maxAgeMs || age < 0) {
      console.error('Token expired or invalid timestamp');
      return false;
    }

    // Verify HMAC signature using timing-safe comparison
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )) {
      console.error('Invalid signature');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}
