import { addHook } from 'pirates';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import parseKeyValuePair from 'parse-key-value-pair';

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

function format(value: ImportMetaEnv[keyof ImportMetaEnv]) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return value ? `"${value}"` : `""`;
}

function compile(code: string, env: ImportMetaEnv) {
  let res = code;
  for (const [key, value] of Object.entries(env)) {
    res = res.replace(new RegExp('import\.meta\.env\.' + key, 'g'), format(value));
  }
  return res;
}

const CWD = cwd();

function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const res: Record<string, string> = {}
  for (const line of lines) {
    try {
      if (line.length > 0) {
        const [key, value] = parseKeyValuePair(line);
        res[key] = value;
      }
    } catch (error) {
      throw new Error(`Couldn't parse content in env file (${filePath}): ${line}`);
    }
  }
  return res;
}

export function register() {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';
  const defaultPath = join(CWD, './.env');
  const defaultLocalPath = join(CWD, './.env.local');
  let ENV_VARS: ImportMetaEnv = {
    MODE: NODE_ENV,
    DEV: NODE_ENV === 'development' || NODE_ENV === 'dev',
    PROD: NODE_ENV === 'prod' || NODE_ENV === 'production',
    SSR: false,
    BASE_URL: '/'
  };
  if (existsSync(defaultPath)) {
    ENV_VARS = { ...ENV_VARS, ...parseEnvFile(defaultPath) };
  }
  if (existsSync(defaultLocalPath)) {
    ENV_VARS = { ...ENV_VARS, ...parseEnvFile(defaultLocalPath) };
  }
  if (NODE_ENV !== 'development') {
    const specificModePath = join(CWD, `./.env.${NODE_ENV}`);
    const specificModeLocalPath = join(CWD, `./.env.${NODE_ENV}`);
    if (existsSync(specificModePath)) {
      ENV_VARS = { ...ENV_VARS, ...parseEnvFile(specificModePath) };
    }
    else if (existsSync(specificModeLocalPath)) {
      ENV_VARS = { ...ENV_VARS, ...parseEnvFile(specificModeLocalPath) };
    }
  }
  addHook((code: string) => compile(code, ENV_VARS), { exts: DEFAULT_EXTENSIONS });
}