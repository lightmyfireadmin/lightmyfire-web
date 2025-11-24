import crypto from 'crypto';

/**
 * Generates a secure internal authentication token using HMAC-SHA256.
 *
 * This function creates a signed token containing a user ID and a timestamp.
 * It is used for securing internal communication or operations that require temporary authorization.
 * The token is constructed by concatenating the JSON payload and its HMAC signature, then Base64 encoding the result.
 *
 * @param {string} userId - The unique identifier of the user to authenticate.
 * @returns {string} A Base64-encoded string containing the payload and its signature.
 * @throws {Error} If the `INTERNAL_AUTH_SECRET` environment variable is not set.
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
 * Verifies the validity of an internal authentication token.
 *
 * This function decodes the token, checks the signature integrity using HMAC-SHA256,
 * verifies that the user ID matches the expected value, and ensures the token has not expired.
 * It uses constant-time comparison for the signature to prevent timing attacks.
 *
 * @param {string} token - The Base64-encoded token to verify.
 * @param {string} expectedUserId - The user ID that is expected to be in the token.
 * @param {number} [maxAgeMs=60000] - The maximum allowed age of the token in milliseconds (default: 60 seconds).
 * @returns {boolean} `true` if the token is valid, matches the user ID, and is not expired; `false` otherwise.
 */
export function verifyInternalAuthToken(
  token: string,
  expectedUserId: string,
  maxAgeMs = 60000
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
