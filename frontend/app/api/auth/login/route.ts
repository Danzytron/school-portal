import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate Limiting Store: Map<IP, { count: number, resetAt: number }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Server-side Demo User Store (Kept strictly on the server, never bundled in client JS)
const SERVER_ACCOUNTS: Record<
  string,
  { passwordHash: string; salt: string; role: 'student' | 'teacher' | 'admin'; name: string; id: number; redirect: string }
> = {
  'student@schoolportal.test': {
    // SHA256 of "Portal2025!" with salt
    passwordHash: crypto.createHash('sha256').update('cec_salt_2026:Portal2025!').digest('hex'),
    salt: 'cec_salt_2026',
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 3,
    redirect: '/student/dashboard',
  },
  'teacher@schoolportal.test': {
    passwordHash: crypto.createHash('sha256').update('cec_salt_2026:Portal2025!').digest('hex'),
    salt: 'cec_salt_2026',
    role: 'teacher',
    name: 'Prof. Justin Beiber',
    id: 2,
    redirect: '/teacher/dashboard',
  },
  'admin@schoolportal.test': {
    passwordHash: crypto.createHash('sha256').update('cec_salt_2026:Portal2025!').digest('hex'),
    salt: 'cec_salt_2026',
    role: 'admin',
    name: 'Registrar Administrator',
    id: 1,
    redirect: '/admin/dashboard',
  },
};

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

function verifyPassword(inputPassword: string, salt: string, expectedHash: string): boolean {
  const inputHash = crypto.createHash('sha256').update(`${salt}:${inputPassword}`).digest('hex');
  const bufferA = Buffer.from(inputHash, 'utf8');
  const bufferB = Buffer.from(expectedHash, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    
    // 1. Rate Limiting Check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      console.warn(`[SECURITY AUDIT] Rate limit triggered for IP: ${ip}`);
      return NextResponse.json(
        { message: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // 2. Parse & Sanitize Input
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password || email.length > 255 || password.length > 255) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Authenticate against Server Store
    const account = SERVER_ACCOUNTS[email];
    const isPasswordValid = account ? verifyPassword(password, account.salt, account.passwordHash) : false;

    if (!account || !isPasswordValid) {
      console.warn(`[SECURITY AUDIT] Failed login attempt for identifier: ${email} from IP: ${ip}`);
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    rateLimitMap.delete(ip);

    // 4. Generate Secure Session Token
    const sessionToken = `cec_sec_${crypto.randomBytes(32).toString('hex')}`;
    const userPayload = {
      id: account.id,
      name: account.name,
      email: email,
      role: account.role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    console.info(`[SECURITY AUDIT] Successful login for user: ${email} (Role: ${account.role}) from IP: ${ip}`);

    // 5. Construct Response & Set Secure HttpOnly Cookies
    const response = NextResponse.json({
      message: 'Login successful',
      user: userPayload,
      token: sessionToken,
      redirect: account.redirect,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Cookie: auth_token (HttpOnly, Secure in prod, SameSite=Lax)
    response.cookies.set({
      name: 'auth_token',
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    // Cookie: auth_role (Used by Edge Middleware for instant role validation)
    response.cookies.set({
      name: 'auth_role',
      value: account.role,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7200,
    });

    return response;
  } catch (error) {
    console.error('[SECURITY ERROR] Login handler exception:', error);
    return NextResponse.json(
      { message: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
