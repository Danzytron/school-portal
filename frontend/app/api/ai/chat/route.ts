import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiChatReply, ChatMessage } from '@/lib/ai/geminiClient';
import { buildPortalContext } from '@/lib/ai/portalContextBuilder';

// Lightweight rate limiting: 45 requests per minute per IP or session
const chatRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 45;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const entry = chatRateLimit.get(id);

  if (!entry || now > entry.resetAt) {
    chatRateLimit.set(id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Check Authentication Tokens
    const tokenCookie = request.cookies.get('auth_token')?.value;
    const roleCookie = request.cookies.get('auth_role')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const activeToken = tokenCookie || headerToken;
    const isAuthenticated = Boolean(activeToken);

    // 2. Rate Limiting Check
    const clientIp = getClientIdentifier(request);
    const rateLimitKey = `${clientIp}_${activeToken ? activeToken.substring(0, 16) : 'anonymous'}`;
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    // 3. Parse & Validate Payload
    const body = await request.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid request. Message cannot be empty.' },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowable length of 4000 characters.' },
        { status: 400 }
      );
    }

    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    // Determine user role and name
    let userRole = 'guest';
    let userName = 'Student';

    if (isAuthenticated) {
      userRole = (roleCookie || (body.role && ['student', 'teacher', 'admin'].includes(body.role) ? body.role : 'student')).toLowerCase();
      userName = body.name || (userRole === 'teacher' ? 'Faculty Member' : userRole === 'admin' ? 'Administrator' : 'Student');
    }

    // 4. Assemble Verified Portal Context (only for authenticated users)
    let portalContext = '';
    if (isAuthenticated && activeToken) {
      portalContext = await buildPortalContext({
        userRole,
        userName,
        token: activeToken,
      });
    } else {
      portalContext = JSON.stringify({
        authenticated: false,
        note: 'User is not signed in. Do not provide personal student records. Guide them to sign in if personal grades or schedules are requested.',
      });
    }

    // 5. Invoke Gemini AI (with multi-turn conversational history and runtime awareness)
    const reply = await generateGeminiChatReply({
      message,
      history,
      context: portalContext,
      userName,
      userRole,
    });

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[LUMI AI ROUTE ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
