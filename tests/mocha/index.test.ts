import * as assert from 'assert';
import { cwd } from 'process';
import { compile, parse, format } from '../../src';

describe('vite-register (under Mocha)', function() {
  it('should format values', function() {
    assert.equal(format(true), 'true');
    assert.equal(format(false), 'false');
    assert.equal(format('0'), '"0"');
    assert.equal(format('hello world'), '"hello world"');
    assert.equal(format(undefined), '""');
  });
  it('should parse content', function() {
    const env = parse('# My env vars\nFOO="bar"\nVITE_FOO="bar"\n\nVITE_FOO2=42\nVITE_FOO3=true');
    assert.ok(!env.FOO);
    assert.ok(env.VITE_FOO);
    assert.equal(env.VITE_FOO, 'bar');
    assert.ok(env.VITE_FOO2);
    assert.equal(env.VITE_FOO2, '42');
    assert.ok(env.VITE_FOO3);
    assert.equal(env.VITE_FOO3, 'true');
  });
  it('should parse content with custom prefixes', function() {
    const env = parse('FOO="bar"\nVITE_FOO="bar"\nCUSTOM_FOO=true', ['VITE_', 'CUSTOM_']);
    assert.ok(!env.FOO);
    assert.ok(env.VITE_FOO);
    assert.equal(env.VITE_FOO, 'bar');
    assert.ok(env.CUSTOM_FOO);
    assert.equal(env.CUSTOM_FOO, 'true');
  });
  it('should compile values', function() {
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
    assert.equal(code, '"development";\n"bar";\n"import\u200b.meta.env.DEV";\n(' + JSON.stringify(config.env) + ').FOO;');
  });
  it('should hook into Mocha', function() {
    // Tests use vite-register hook, it is expected to get access to `import.meta.env`.
    assert.ok(import.meta.env.DEV);
  });
});