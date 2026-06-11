import { NextResponse } from 'next/server';
import {
  createAuthAccountClient,
  createSessionResponse,
  defaultDisplayName,
  ensureAuthProfile,
  ensureStarterTeamMember,
  findAuthUserByEmail,
  normalizeAuthEmail,
  normalizeAuthPassword,
} from '@/lib/server/authAccounts';

export const dynamic = 'force-dynamic';

type SignUpBody = {
  email?: string;
  password?: string;
  displayName?: string;
  inviteCode?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpBody;

    // Audit C1: sign-up is invite-only. When SIGNUP_INVITE_CODE is unset the
    // route is disabled entirely.
    const expectedInviteCode = process.env.SIGNUP_INVITE_CODE?.trim();
    const inviteCode = typeof body.inviteCode === 'string' ? body.inviteCode.trim() : '';

    if (!expectedInviteCode || inviteCode !== expectedInviteCode) {
      return NextResponse.json({ error: 'Sign-up is disabled.' }, { status: 403 });
    }

    const email = normalizeAuthEmail(body.email);
    const password = normalizeAuthPassword(body.password);
    const displayName = typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : defaultDisplayName(email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const supabase = createAuthAccountClient();
    const existingUser = await findAuthUserByEmail(supabase, email);

    if (existingUser) {
      return NextResponse.json({ error: 'This email already has an account. Please sign in.' }, { status: 409 });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        createdBy: 'head-office-sign-up',
        displayName,
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Unable to create account.');
    }

    const profile = await ensureAuthProfile(supabase, data.user, displayName);
    await ensureStarterTeamMember(supabase, profile.id);
    const session = await createSessionResponse(supabase, email, password, displayName);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign up.';
    const status = /missing next_public_supabase_url|missing supabase/i.test(message) ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
