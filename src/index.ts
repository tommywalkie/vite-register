import { addHook } from 'pirates';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import type { UserConfig } from 'vite';
import parseKeyValuePair from 'parse-key-value-pair';

const CWD = cwd();
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

export function format(value: ImportMetaEnv[keyof ImportMetaEnv]) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return value ? `"${value}"` : `""`;
}

export function compile(code: string, env: Record<string, any>) {
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

type ResolvedConfig = UserConfig & {
  mode?: string
  base?: string
  env: Record<string, any>
}

export function register() {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';
  const PROD = NODE_ENV === 'prod' || NODE_ENV === 'production';
  let config: ResolvedConfig = {
    env: {
      MODE: NODE_ENV,
      DEV: !PROD,
      PROD,
      SSR: false,
      BASE_URL: '/'
    }
  };
  function tryReadViteConfig(path: string) {
    if (existsSync(path)) {
      const resolvedConfig: ResolvedConfig = require(path).default;
      config = { ...config, ...resolvedConfig };
      if (resolvedConfig.base) config.env.BASE_URL = resolvedConfig.base;
    }
  }
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
      config.env = { ...config.env, ...tryReadFrom(path) };
    }
  }
  tryReadViteConfig(join(CWD, './vite.config.js'));
  tryReadViteConfig(join(CWD, './vite.config.ts'));
  tryReadViteConfig(join(CWD, './vite.config.mjs'));
  tryGatherFrom(join(CWD, './.env'));
  tryGatherFrom(join(CWD, './.env.local'));
  if (NODE_ENV !== 'development') {
    tryGatherFrom(join(CWD, `./.env.${NODE_ENV}`));
    tryGatherFrom(join(CWD, `./.env.${NODE_ENV}`));
  }
  return addHook((code: string) => compile(code, config.env), { exts: DEFAULT_EXTENSIONS });
}