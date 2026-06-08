import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const requiredEnvironmentVariables = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
] as const;

const optionalEnvironmentVariables = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    defaultValue: 'optional; login and sign-up use server auth routes',
  },
  {
    name: 'OPENAI_EMBEDDING_MODEL',
    defaultValue: 'text-embedding-3-small',
  },
  {
    name: 'OPENAI_AGENT_TEXT_MODEL',
    defaultValue: 'gpt-5.4',
  },
  {
    name: 'BUFFER_ACCESS_TOKEN',
    defaultValue: 'required before live publishing sync is enabled',
  },
  {
    name: 'MULTICA_DAEMON_STATE',
    defaultValue: 'optional local daemon diagnostic, for example running',
  },
  {
    name: 'MULTICA_DAEMON_ID',
    defaultValue: 'optional local daemon diagnostic from Multica desktop',
  },
  {
    name: 'MULTICA_SERVER_URL',
    defaultValue: 'optional local daemon diagnostic from Multica desktop',
  },
  {
    name: 'MULTICA_AGENT_BRIDGE_URL',
    defaultValue: 'required before Multica daemon can execute agent tasks from this server',
  },
  {
    name: 'MULTICA_AGENT_BRIDGE_SECRET',
    defaultValue: 'required before Multica daemon can execute agent tasks from this server',
  },
  {
    name: 'CODEX_LOCAL_BRIDGE_URL',
    defaultValue: 'required before local Codex bridge actions are enabled',
  },
  {
    name: 'CODEX_LOCAL_BRIDGE_SECRET',
    defaultValue: 'required before local Codex bridge actions are enabled',
  },
] as const;

export function GET() {
  const required = requiredEnvironmentVariables.map((name) => ({
    name,
    configured: Boolean(process.env[name]),
  }));
  const optional = optionalEnvironmentVariables.map(({ name, defaultValue }) => ({
    name,
    configured: Boolean(process.env[name]),
    defaultValue,
  }));
  const missing = required.filter((item) => !item.configured).map((item) => item.name);
  const ready = missing.length === 0;

  return NextResponse.json(
    {
      status: ready ? 'ok' : 'degraded',
      service: 'ai-content-platform',
      checks: {
        runtimeEnvironment: {
          ready,
          required,
          optional,
          missing,
        },
      },
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
