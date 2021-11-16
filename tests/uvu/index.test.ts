import { cwd } from 'process';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { compile, parse, format } from '../../src';

const $ = suite('vite-register (under UVU)');

$('Can format values', () => {
  assert.is(format(true), 'true');
  assert.is(format(false), 'false');
  assert.is(format('0'), '"0"');
  assert.is(format('hello world'), '"hello world"');
  assert.is(format(undefined), '""');
});

$('Can parse content', () => {
  const env = parse('# My env vars\nFOO="bar"\nVITE_FOO="bar"\n\nVITE_FOO2=42\nVITE_FOO3=true');
  assert.not.ok(env.FOO);
  assert.ok(env.VITE_FOO);
  assert.is(env.VITE_FOO, 'bar');
  assert.ok(env.VITE_FOO2);
  assert.is(env.VITE_FOO2, '42');
  assert.ok(env.VITE_FOO3);
  assert.is(env.VITE_FOO3, 'true');
});

$('Can compile content', () => {
  // Escape static replacement during this specific test.
  const $1 = 'import';
  const $2 = 'meta';
  const $3 = 'env';
  const importMetaStr = `${$1}.${$2}.${$3}`;
  const config = {
    envDir: cwd(),
    envPrefix: ['VITE_'],
    env: {
      MODE: 'development',
      SSR: false,
      DEV: true,
      PROD: false,
      BASE_URL: '/',
      VITE_FOO: 'bar'
    }
  }
  const code = compile(`${importMetaStr}.MODE;\n${importMetaStr}.VITE_FOO;\n"import\u200b.meta.env.DEV";\n${importMetaStr}.FOO;`, config);
  assert.is(code, '"development";\n"bar";\n"import\u200b.meta.env.DEV";\n(' + JSON.stringify(config.env) + ').FOO;');
});

$('Can hook into uvu', () => {
  // Tests use vite-register hook, it is expected to get access to `import.meta.env`.
  assert.ok(import.meta.env.DEV);
});

$.run();