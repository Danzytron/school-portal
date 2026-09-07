import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOtpStatusList, resetOtpBatchWithNewPasswords } from '@/lib/serverOtpStore';

function isAuthorized(request: NextRequest): boolean {
  const role = request.cookies.get('auth_role')?.value;
  const adminKeyHeader = request.headers.get('x-admin-key');
  const validKey = process.env.ADMIN_OTP_KEY || 'cec_admin_otp_secret_2026';

  if (role === 'admin') return true;
  if (adminKeyHeader && adminKeyHeader === validKey) return true;
  return false;
}

function generateSecureRandomPassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*-_=+';
  const all = upper + lower + digits + special;

  const pwd = [
    upper[crypto.randomInt(upper.length)],
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
    special[crypto.randomInt(special.length)],
  ];

  while (pwd.length < length) {
    pwd.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = pwd.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  return pwd.join('');
}

// GET /api/admin/otp - View status of all one-time passwords
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized access.' }, { status: 401 });
  }

  const list = getOtpStatusList();
  const summary = {
    total: list.length,
    available: list.filter((x) => x.status === 'AVAILABLE').length,
    used: list.filter((x) => x.status === 'USED').length,
    passwords: list,
  };

  return NextResponse.json(summary);
}

// POST /api/admin/otp - Reset & generate 10 new secure one-time passwords
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized access.' }, { status: 401 });
  }

  const newBatch = [];
  for (let i = 1; i <= 10; i++) {
    newBatch.push({
      id: i,
      label: `OTP-${String(i).padStart(2, '0')}`,
      password: generateSecureRandomPassword(16),
    });
  }

  resetOtpBatchWithNewPasswords(newBatch);

  return NextResponse.json({
    message: 'Successfully generated 10 new one-time passwords.',
    newPasswords: newBatch.map((item) => ({
      id: item.id,
      label: item.label,
      password: item.password,
    })),
  });
}
