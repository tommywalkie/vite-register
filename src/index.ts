import { addHook } from 'pirates';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd, exit } from 'process';
import type { UserConfig } from 'vite';
import parseKeyValuePair from 'parse-key-value-pair';

const CWD = cwd();
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

export function format(value: ImportMetaEnv[keyof ImportMetaEnv]) {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return value ? `"${value}"` : `""`;
}

export function compile(content: string, env: Record<string, any>) {
  let res = content;
  const $1 = 'import';
  const $2 = 'meta';
  const $3 = 'env';
  // This is intentional, in order to make sure the hook doesn't rewrite itself
  const importMetaStr = `${$1}.${$2}.${$3}`;
  for (const [key, value] of Object.entries(env)) {
    res = res.split(`${importMetaStr}.${key}`).join(format(value));
  }
  const envStr = JSON.stringify(env);
  // Esbuild may parse 'import.meta' into a newly created 'import_meta' var
  // https://github.com/evanw/esbuild/blob/a133f7dd2670e396ca3ef884ac3436e3de817876/internal/js_parser/js_parser.go#L14382
  res = res.split(`${$1}_${$2} = {}`).join(`${$1}_${$2} = { env: ${envStr} }`);
  res = res.split(`${$1}_${$2}={}`).join(`${$1}_${$2}={env:${envStr}}`);
  // In case there are still 'import.meta' refs, or if original content was already in CommonJS.
  res = res.split(`${importMetaStr}.`).join(`(${envStr}).`);
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
          if (key.startsWith('VITE_') || key === 'NODE_ENV') env[key] = value;
        }
      }
    } catch (error) {
      throw new Error(`Couldn't parse line: ${line}`);
    }
  }
  return env;
}

type Config = UserConfig & {
  mode?: string
  base?: string
  env: Record<string, any>
}

export function resolveConfig() {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';
  const PROD = NODE_ENV === 'prod' || NODE_ENV === 'production';
  let config: Config = {
    env: {
      MODE: NODE_ENV,
      DEV: !PROD,
      PROD,
      SSR: false,
      BASE_URL: '/'
    }
  };
  function tryReadViteConfigFrom(path: string) {
    if (existsSync(path)) {
      try {
        const resolvedConfig: Config = require(path).default;
        config = { ...config, ...resolvedConfig };
        if (resolvedConfig.base) config.env.BASE_URL = resolvedConfig.base;
        if (resolvedConfig.mode) config.env.MODE = resolvedConfig.mode;
      }
      catch(err: any) {
        const error = err as Error;
        const isModuleError = error.message.startsWith('Cannot use import statement outside a module');
        const explanation = isModuleError
          ? `some import/export statements were found in the said file, this means you'll need to use a third-party transpiler hook like 'tsm' or 'esbuild-runner' in order to support TypeScript/ESM syntax.`
          : `throwing the following error:\n${error.stack}`;
        const message = `Error: vite-register found Vite configuration file (${path}) but was unable to handle it, ${explanation}`;
        console.error(message);
        exit(1);
      }
    }
  }
  function tryReadEnvFrom(path: string) {
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf8');
      try {
        const pairs = parse(content);
        config.env = { ...config.env, ...pairs };
        if (pairs.NODE_ENV) config.env.MODE = pairs.NODE_ENV;
      }
      catch(error: any) {
        throw new Error(`Couldn't parse env file, encountered following error:\n${error.message}`);
      }
    }
  }
  tryReadViteConfigFrom(join(CWD, './vite.config.js'));
  tryReadViteConfigFrom(join(CWD, './vite.config.ts'));
  tryReadViteConfigFrom(join(CWD, './vite.config.mjs'));
  tryReadEnvFrom(join(CWD, './.env'));
  tryReadEnvFrom(join(CWD, './.env.local'));
  if (NODE_ENV !== 'development') {
    tryReadEnvFrom(join(CWD, `./.env.${NODE_ENV}`));
    tryReadEnvFrom(join(CWD, `./.env.${NODE_ENV}.local`));
  }
  return config;
}

export function register() {
  const config = resolveConfig();
  return addHook((code: string) => compile(code, config.env), { exts: DEFAULT_EXTENSIONS });
}