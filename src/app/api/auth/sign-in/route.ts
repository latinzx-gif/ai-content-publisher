import { NextResponse } from 'next/server';
import { createAuthAccountClient, createSessionResponse, normalizeAuthEmail, normalizeAuthPassword } from '@/lib/server/authAccounts';

export const dynamic = 'force-dynamic';

type SignInBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInBody;
    const email = normalizeAuthEmail(body.email);
    const password = normalizeAuthPassword(body.password);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = createAuthAccountClient();
    const session = await createSessionResponse(supabase, email, password);

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    const status = /missing next_public_supabase_url|missing supabase/i.test(message) ? 503 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}
