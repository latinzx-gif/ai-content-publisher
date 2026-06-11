import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

export type AgentRuntimeProvider = 'multica' | 'claude' | 'codex' | 'openai';
export type AgentRuntimePreference = 'auto' | AgentRuntimeProvider;

export type LocalRuntimeTool = {
  id: string;
  label: string;
  command: string;
  available: boolean;
  path: string | null;
  capabilities: string[];
  reason: string;
};

export type AgentRuntimeCandidate = {
  id: AgentRuntimeProvider;
  label: string;
  available: boolean;
  priority: number;
  reason: string;
  checks: Record<string, boolean>;
};

export type AgentRuntimeSelection = {
  preference: AgentRuntimePreference;
  selectedProvider: AgentRuntimeProvider | null;
  candidates: AgentRuntimeCandidate[];
  localTools: LocalRuntimeTool[];
  scanScope: 'server_process';
};

export function normalizeAgentRuntimePreference(value: unknown): AgentRuntimePreference {
  return value === 'multica' || value === 'claude' || value === 'codex' || value === 'openai' || value === 'auto'
    ? value
    : 'auto';
}

export function discoverAgentRuntimes(preference: AgentRuntimePreference = 'auto'): AgentRuntimeSelection {
  const localTools = scanLocalRuntimeTools();
  const multicaCli = localTools.find((tool) => tool.id === 'multica');
  const claudeCli = localTools.find((tool) => tool.id === 'claude');
  const codexCli = localTools.find((tool) => tool.id === 'codex');
  const multicaBridgeUrl = process.env.MULTICA_AGENT_BRIDGE_URL?.trim();
  const multicaBridgeSecret = process.env.MULTICA_AGENT_BRIDGE_SECRET?.trim();
  const multicaDaemonState = process.env.MULTICA_DAEMON_STATE?.trim().toLowerCase();
  const multicaDaemonId = process.env.MULTICA_DAEMON_ID?.trim();
  const multicaServerUrl = process.env.MULTICA_SERVER_URL?.trim();
  const codexBridgeUrl = process.env.CODEX_LOCAL_BRIDGE_URL?.trim();
  const codexBridgeSecret = process.env.CODEX_LOCAL_BRIDGE_SECRET?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const multicaUrlLooksValid = Boolean(multicaBridgeUrl && /^https?:\/\//i.test(multicaBridgeUrl));
  const multicaDaemonRunning = multicaDaemonState === 'running' || Boolean(multicaDaemonId);
  const multicaAvailable = Boolean(multicaDaemonRunning && multicaUrlLooksValid && multicaBridgeSecret);
  const codexUrlLooksValid = Boolean(codexBridgeUrl && /^https?:\/\//i.test(codexBridgeUrl));
  const codexAvailable = Boolean(codexUrlLooksValid && codexBridgeSecret);
  const openAiAvailable = Boolean(openAiKey);

  const candidates: AgentRuntimeCandidate[] = [
    {
      id: 'multica',
      label: 'Multica Local Daemon',
      available: multicaAvailable,
      priority: 15,
      reason: multicaAvailable
        ? 'Multica daemon and agent bridge are configured.'
        : !multicaDaemonRunning
          ? 'Multica daemon is not exposed to this server runtime yet.'
          : !multicaBridgeUrl
            ? 'Multica daemon is detected, but MULTICA_AGENT_BRIDGE_URL is missing.'
            : !multicaUrlLooksValid
              ? 'MULTICA_AGENT_BRIDGE_URL must be an HTTP endpoint.'
              : 'Missing MULTICA_AGENT_BRIDGE_SECRET.',
      checks: {
        daemonRunning: multicaDaemonRunning,
        daemonIdConfigured: Boolean(multicaDaemonId),
        serverUrlConfigured: Boolean(multicaServerUrl),
        bridgeUrlConfigured: Boolean(multicaBridgeUrl),
        bridgeUrlHttp: multicaUrlLooksValid,
        bridgeSecretConfigured: Boolean(multicaBridgeSecret),
        cliDetected: Boolean(multicaCli?.available),
      },
    },
    {
      id: 'claude',
      label: 'Claude Code Local Bridge',
      available: codexAvailable,
      priority: 12,
      reason: codexAvailable
        ? 'Local agent bridge is configured for Claude Code execution.'
        : !codexBridgeUrl
          ? 'Missing CODEX_LOCAL_BRIDGE_URL (shared Head Office agent bridge).'
          : !codexUrlLooksValid
            ? 'CODEX_LOCAL_BRIDGE_URL must be an HTTP endpoint.'
            : 'Missing CODEX_LOCAL_BRIDGE_SECRET.',
      checks: {
        bridgeUrlConfigured: Boolean(codexBridgeUrl),
        bridgeUrlHttp: codexUrlLooksValid,
        bridgeSecretConfigured: Boolean(codexBridgeSecret),
        cliDetected: Boolean(claudeCli?.available),
      },
    },
    {
      id: 'codex',
      label: 'Codex Local Bridge',
      available: codexAvailable,
      priority: 10,
      reason: codexAvailable
        ? 'CODEX_LOCAL_BRIDGE_URL and CODEX_LOCAL_BRIDGE_SECRET are configured.'
        : !codexBridgeUrl
          ? 'Missing CODEX_LOCAL_BRIDGE_URL.'
          : !codexUrlLooksValid
            ? 'CODEX_LOCAL_BRIDGE_URL must be an HTTP endpoint.'
            : 'Missing CODEX_LOCAL_BRIDGE_SECRET.',
      checks: {
        bridgeUrlConfigured: Boolean(codexBridgeUrl),
        bridgeUrlHttp: codexUrlLooksValid,
        bridgeSecretConfigured: Boolean(codexBridgeSecret),
        cliDetected: Boolean(codexCli?.available),
      },
    },
    {
      id: 'openai',
      label: 'OpenAI API Runtime',
      available: openAiAvailable,
      priority: 5,
      reason: openAiAvailable ? 'OPENAI_API_KEY is configured.' : 'Missing OPENAI_API_KEY.',
      checks: {
        apiKeyConfigured: openAiAvailable,
      },
    },
  ];

  const selectedProvider =
    preference === 'multica'
      ? multicaAvailable
        ? 'multica'
        : codexAvailable
          ? 'codex'
          : openAiAvailable
            ? 'openai'
            : null
      : preference === 'claude'
        ? codexAvailable
          ? 'claude'
          : openAiAvailable
            ? 'openai'
            : null
        : preference === 'codex'
          ? codexAvailable
            ? 'codex'
            : openAiAvailable
              ? 'openai'
              : null
          : preference === 'openai'
            ? openAiAvailable
              ? 'openai'
              : null
            : [...candidates]
                .sort((left, right) => right.priority - left.priority)
                .find((candidate) => candidate.available)?.id ?? null;

  return {
    preference,
    selectedProvider,
    candidates,
    localTools,
    scanScope: 'server_process',
  };
}

function scanLocalRuntimeTools(): LocalRuntimeTool[] {
  const specs = [
    {
      id: 'multica',
      label: 'Multica CLI',
      command: 'multica',
      capabilities: ['runtime_discovery', 'daemon_gateway', 'local_agent_control'],
      fallbackPaths: ['/opt/homebrew/bin/multica', '/usr/local/bin/multica'],
    },
    {
      id: 'claude',
      label: 'Claude Code CLI',
      command: 'claude',
      capabilities: ['code_edit', 'audit', 'agent_task', 'workspace_reasoning'],
      fallbackPaths: ['/opt/homebrew/bin/claude', '/usr/local/bin/claude'],
    },
    {
      id: 'codex',
      label: 'Codex CLI',
      command: 'codex',
      capabilities: ['code_edit', 'audit', 'agent_task'],
      fallbackPaths: ['/opt/homebrew/bin/codex', '/usr/local/bin/codex'],
    },
    {
      id: 'node',
      label: 'Node.js',
      command: 'node',
      capabilities: ['script_runtime', 'local_worker'],
      fallbackPaths: ['/opt/homebrew/bin/node', '/usr/local/bin/node'],
    },
    {
      id: 'python',
      label: 'Python',
      command: 'python3',
      capabilities: ['script_runtime', 'data_processing'],
      fallbackPaths: ['/opt/homebrew/bin/python3', '/usr/local/bin/python3'],
    },
    {
      id: 'git',
      label: 'Git',
      command: 'git',
      capabilities: ['repository_inspection'],
      fallbackPaths: ['/opt/homebrew/bin/git', '/usr/local/bin/git'],
    },
  ];

  return specs.map((spec) => {
    const path = findCommandPath(spec.command, spec.fallbackPaths);
    const available = Boolean(path);

    return {
      id: spec.id,
      label: spec.label,
      command: spec.command,
      available,
      path,
      capabilities: spec.capabilities,
      reason: available ? `${spec.command} is available in this server process.` : `${spec.command} is not visible to this server process PATH.`,
    };
  });
}

function findCommandPath(command: string, fallbackPaths: string[]) {
  try {
    const result = execFileSync('/bin/zsh', ['-lc', `command -v ${shellQuote(command)}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 1000,
    }).trim();

    if (result) {
      return result;
    }
  } catch {
    // Fall through to common macOS paths.
  }

  return fallbackPaths.find((candidate) => existsSync(candidate)) ?? null;
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
