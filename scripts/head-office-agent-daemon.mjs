#!/usr/bin/env node
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { loadLocalEnvFiles } from './load-local-env.mjs';

loadLocalEnvFiles(['.env.local', '.env.vercel.local']);

const host = process.env.HEAD_OFFICE_AGENT_DAEMON_HOST || '127.0.0.1';
const port = Number(process.env.HEAD_OFFICE_AGENT_DAEMON_PORT || '8787');
const secret = process.env.CODEX_LOCAL_BRIDGE_SECRET || process.env.HEAD_OFFICE_AGENT_DAEMON_SECRET || '';
const workspaceRoot = process.env.HEAD_OFFICE_AGENT_WORKSPACE || process.cwd();
const codexCommand = process.env.HEAD_OFFICE_CODEX_COMMAND || 'codex';
const codexArgs = parseArgs(process.env.HEAD_OFFICE_CODEX_ARGS || 'exec -');
const claudeCommand = process.env.HEAD_OFFICE_CLAUDE_COMMAND || 'claude';
const claudeDefaultModel = process.env.HEAD_OFFICE_CLAUDE_DEFAULT_MODEL || 'claude-sonnet-4-6';
const requestTimeoutMs = Number(process.env.HEAD_OFFICE_AGENT_TIMEOUT_MS || '120000');
const maxBodyBytes = Number(process.env.HEAD_OFFICE_AGENT_MAX_BODY_BYTES || String(512 * 1024));
const startedAt = Date.now();
const daemonId = process.env.HEAD_OFFICE_AGENT_DAEMON_ID || randomUUID();

if (!secret) {
  console.error('Missing CODEX_LOCAL_BRIDGE_SECRET or HEAD_OFFICE_AGENT_DAEMON_SECRET.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  try {
    response.setHeader('content-type', 'application/json');

    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, buildHealth());
      return;
    }

    if (request.method === 'GET' && request.url === '/runtime/discover') {
      if (!isAuthorized(request)) {
        sendJson(response, 401, { error: 'Unauthorized' });
        return;
      }

      sendJson(response, 200, buildDiscovery());
      return;
    }

    if (request.method === 'POST' && request.url === '/runtime/execute') {
      if (!isAuthorized(request)) {
        sendJson(response, 401, { error: 'Unauthorized' });
        return;
      }

      const body = await readJsonBody(request);
      const result = await executeRuntime(body);
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Daemon request failed',
    });
  }
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}/runtime/execute`;
  console.log(`Head Office Agent Daemon running at ${url}`);
  console.log('Set CODEX_LOCAL_BRIDGE_URL to the URL above and reuse the configured bridge secret.');
});

function isAuthorized(request) {
  const header = request.headers.authorization || '';
  return header === `Bearer ${secret}`;
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on('data', (chunk) => {
      size += chunk.length;

      if (size > maxBodyBytes) {
        reject(new Error('Request body too large'));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');

      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Request body must be valid JSON'));
      }
    });

    request.on('error', reject);
  });
}

function buildHealth() {
  const discovery = buildDiscovery();

  return {
    status: 'running',
    daemonId,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    workspaceRoot,
    runtimes: discovery.runtimes,
  };
}

function buildDiscovery() {
  const tools = [
    {
      id: 'claude',
      label: 'Claude Code CLI',
      command: claudeCommand,
      path: findCommandPath(claudeCommand),
      capabilities: ['agent_task', 'text_generation', 'code_audit', 'workspace_reasoning'],
    },
    {
      id: 'codex',
      label: 'Codex CLI',
      command: codexCommand,
      path: findCommandPath(codexCommand),
      capabilities: ['agent_task', 'text_generation', 'code_audit', 'workspace_reasoning'],
    },
    {
      id: 'node',
      label: 'Node.js',
      command: 'node',
      path: findCommandPath('node'),
      capabilities: ['script_runtime', 'local_worker'],
    },
    {
      id: 'python',
      label: 'Python',
      command: 'python3',
      path: findCommandPath('python3'),
      capabilities: ['script_runtime', 'data_processing'],
    },
    {
      id: 'git',
      label: 'Git',
      command: 'git',
      path: findCommandPath('git'),
      capabilities: ['repository_inspection'],
    },
  ].map((tool) => ({
    ...tool,
    available: Boolean(tool.path),
    reason: tool.path ? `${tool.command} is available.` : `${tool.command} is not visible to this daemon PATH.`,
  }));

  return {
    manager: 'head-office-agent-daemon',
    daemonId,
    state: 'running',
    workspaceRoot,
    runtimes: tools,
  };
}

async function executeRuntime(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  const provider = typeof body.provider === 'string' ? body.provider : 'codex';

  if (provider !== 'codex' && provider !== 'claude') {
    throw new Error(`Unsupported daemon provider: ${provider}`);
  }

  if (!isWorkspaceAllowed(workspaceRoot)) {
    throw new Error('Workspace is not allowed for daemon execution');
  }

  const prompt = buildAgentPrompt(body);
  const started = Date.now();

  if (provider === 'claude') {
    const executablePath = findCommandPath(claudeCommand);

    if (!executablePath) {
      throw new Error(`${claudeCommand} is not available to the daemon process`);
    }

    const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : claudeDefaultModel;
    const args = [
      '-p',
      prompt,
      '--output-format',
      'text',
      '--permission-mode',
      'acceptEdits',
      '--dangerously-skip-permissions',
      '--model',
      model,
    ];

    for (const directory of listAllowedWorkspaceDirs()) {
      args.push('--add-dir', directory);
    }

    const output = await runCommand({
      command: executablePath,
      args,
      stdin: '',
      cwd: workspaceRoot,
      timeoutMs: requestTimeoutMs,
    });

    return {
      responseId: randomUUID(),
      text: output.trim(),
      usage: {
        runtime: 'claude',
        durationMs: Date.now() - started,
        command: claudeCommand,
        model,
      },
      raw: {
        provider: 'claude',
        daemonId,
        workspaceRoot,
      },
    };
  }

  const executablePath = findCommandPath(codexCommand);

  if (!executablePath) {
    throw new Error(`${codexCommand} is not available to the daemon process`);
  }

  const output = await runCommand({
    command: executablePath,
    args: codexArgs,
    stdin: prompt,
    cwd: workspaceRoot,
    timeoutMs: requestTimeoutMs,
  });

  return {
    responseId: randomUUID(),
    text: output.trim(),
    usage: {
      runtime: 'codex',
      durationMs: Date.now() - started,
      command: codexCommand,
      args: codexArgs,
    },
    raw: {
      provider: 'codex',
      daemonId,
      workspaceRoot,
    },
  };
}

function listAllowedWorkspaceDirs() {
  return (process.env.HEAD_OFFICE_AGENT_ALLOWED_WORKSPACES || workspaceRoot)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildAgentPrompt(body) {
  return [
    body.instructions ? `Instructions:\n${body.instructions}` : '',
    `Response format: ${body.responseFormat === 'json' ? 'Return strict JSON only.' : 'Return plain text.'}`,
    `Model requested by Head Office: ${typeof body.model === 'string' ? body.model : 'unspecified'}`,
    'Agent input:',
    JSON.stringify(body.input || {}, null, 2),
  ]
    .filter(Boolean)
    .join('\n\n');
}

function runCommand({ command, args, stdin, cwd, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NO_COLOR: '1',
      },
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Runtime command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    const stdout = [];
    const stderr = [];

    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const output = Buffer.concat(stdout).toString('utf8');
      const errorOutput = Buffer.concat(stderr).toString('utf8');

      if (code !== 0) {
        reject(new Error(errorOutput.trim() || `Runtime command exited with code ${code}`));
        return;
      }

      resolve(output || errorOutput);
    });

    child.stdin.end(stdin);
  });
}

function isWorkspaceAllowed(candidate) {
  return listAllowedWorkspaceDirs().some(
    (allowedPath) => candidate === allowedPath || candidate.startsWith(`${allowedPath}/`),
  );
}

function findCommandPath(command) {
  const fallbackPaths = [
    `/opt/homebrew/bin/${command}`,
    `/usr/local/bin/${command}`,
    `/usr/bin/${command}`,
  ];

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
    // Fall through to common paths.
  }

  return fallbackPaths.find((candidate) => existsSync(candidate)) || null;
}

function parseArgs(value) {
  return value
    .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
    ?.map((item) => item.replace(/^['"]|['"]$/g, '')) || [];
}

function shellQuote(value) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
