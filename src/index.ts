import { addHook } from 'pirates';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import parseKeyValuePair from 'parse-key-value-pair';

const CWD = cwd();
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

export function format(value: ImportMetaEnv[keyof ImportMetaEnv]) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return value ? `"${value}"` : `""`;
}

export function compile(code: string, env: ImportMetaEnv) {
  let res = code;
  for (const [key, value] of Object.entries(env)) {
    res = res.replace(new RegExp('import\.meta\.env\.' + key, 'g'), format(value));
  }
  return res;
}

export function parse(content: string) {
  const lines = content.split('\n');
  const env: Record<string, string> = {}
  for (const line of lines) {
    try {
      if (line.length > 0 && !line.startsWith('#')) {
        const pair = parseKeyValuePair(line);
        if (pair) {
          const [key, value] = pair;
          if (key.startsWith('VITE_')) env[key] = value;
        }
      }
    } catch (error) {
      throw new Error(`Couldn't parse line: ${line}`);
    }
  }
  return env;
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
  function tryReadFrom(filePath: string): Record<string, string> {
    const content = readFileSync(filePath, 'utf8');
    try {
      return parse(content);
    }
    catch(error: any) {
      throw new Error(`Couldn't parse env file, encountered following error:\n${error.message}`);
    }
  }
  function tryGatherFrom(path: string) {
    if (existsSync(path)) {
      ENV_VARS = { ...ENV_VARS, ...tryReadFrom(path) };
    }
  }
  tryGatherFrom(defaultPath);
  tryGatherFrom(defaultLocalPath);
  if (NODE_ENV !== 'development') {
    const specificModePath = join(CWD, `./.env.${NODE_ENV}`);
    const specificModeLocalPath = join(CWD, `./.env.${NODE_ENV}`);
    tryGatherFrom(specificModePath);
    tryGatherFrom(specificModeLocalPath);
  }
  addHook((code: string) => compile(code, ENV_VARS), { exts: DEFAULT_EXTENSIONS });
}