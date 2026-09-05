import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('auth_role')?.value;

  if (!token || !role) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role,
  });
}
