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
  const importMetaStr = 'import' + '.meta' + '.env';
  const code = compile(`${importMetaStr}.MODE;\n${importMetaStr}.VITE_FOO;\n"import\u200b.meta.env.DEV"`, {
    MODE: 'development',
    SSR: false,
    DEV: true,
    PROD: false,
    BASE_URL: '/',
    VITE_FOO: 'bar'
  });
  assert.is(code, '"development";\n"bar";\n"import\u200b.meta.env.DEV"');
});

$('Can hook into Uvu', () => {
  // Tests use vite-register hook, it is expected to get access to `import.meta.env`.
  assert.ok(import.meta.env.DEV);
});

$.run();