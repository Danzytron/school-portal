/**
 * Server-side Cloudflare Turnstile Token Verification
 * Cebu Eastern College (CEC) School Portal Security Subsystem
 */

const CLOUDFLARE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Cloudflare official dummy testing secret key for development / testing:
// '1x0000000000000000000000000000000AA' (Always passes)
const FALLBACK_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export interface TurnstileVerifyResult {
  success: boolean;
  message?: string;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
}

/**
 * Validates a Cloudflare Turnstile token directly against Cloudflare's verification endpoint.
 *
 * @param token - The turnstile response token received from the client widget.
 * @param remoteIp - The client IP address (from CF-Connecting-IP or X-Forwarded-For).
 * @returns Verification result object.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      message: 'Missing security verification. Please complete the Cloudflare security check.',
      errorCodes: ['missing-input-response'],
    };
  }

  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim() || FALLBACK_TEST_SECRET_KEY;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp && remoteIp !== '127.0.0.1' && remoteIp !== '::1') {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      console.error(
        `[SECURITY AUDIT] Cloudflare Turnstile siteverify HTTP error: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        message: 'Security verification service is temporarily unreachable.',
        errorCodes: [`http-status-${response.status}`],
      };
    }

    const outcome = await response.json();

    if (outcome.success === true) {
      return {
        success: true,
        challengeTs: outcome.challenge_ts,
        hostname: outcome.hostname,
      };
    }

    const errorCodes: string[] = outcome['error-codes'] || ['invalid-input-response'];
    console.warn(
      `[SECURITY AUDIT] Cloudflare Turnstile verification failed. Error codes: ${errorCodes.join(
        ', '
      )} for IP: ${remoteIp || 'unknown'}`
    );

    let userFriendlyMessage = 'Security check failed. Please complete the verification challenge again.';
    if (errorCodes.includes('timeout-or-duplicate')) {
      userFriendlyMessage = 'Security verification expired or was already used. Please verify again.';
    }

    return {
      success: false,
      message: userFriendlyMessage,
      errorCodes,
    };
  } catch (error: any) {
    console.error('[SECURITY ERROR] Turnstile verification exception:', error);
    return {
      success: false,
      message: 'Security verification error. Please refresh the page and try again.',
      errorCodes: ['verification-exception'],
    };
  }
}
