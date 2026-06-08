import { existsSync, readFileSync } from 'node:fs';

const defaultEnvFiles = ['.vercel/.env.production.local', '.env.vercel.local', '.env.smoke.local'];

export function loadLocalEnvFiles(paths = defaultEnvFiles) {
  for (const path of paths) {
    if (!existsSync(path)) {
      continue;
    }

    const source = readFileSync(path, 'utf8');

    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const name = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();

      const value = unquote(rawValue);

      if (!name || (process.env[name] !== undefined && process.env[name] !== '')) {
        continue;
      }

      process.env[name] = value;
    }
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
