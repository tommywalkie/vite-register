

<div align="center">
  <h1>vite-register</h1>
</div>

<div align="center">
  <a href="https://npmjs.org/package/vite-register">
    <img src="https://badgen.now.sh/npm/v/vite-register" alt="version" />
  </a>
  <a href="https://github.com/tommywalkie/vite-register/actions/workflows/ci.yml">
    <img src="https://github.com/tommywalkie/vite-register/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://npmjs.org/package/vite-register">
    <img src="https://badgen.now.sh/npm/dm/vite-register" alt="downloads" />
  </a>
  <a href="https://packagephobia.now.sh/result?p=vite-register">
    <img src="https://packagephobia.now.sh/badge?p=vite-register" alt="install size" />
  </a>
</div>
<div align="center">
  <p>Use Vite <a href="https://vitejs.dev/guide/env-and-mode.html">env variables</a>  inside Node scripts and test runners via a require hook.</p>
</div>

<br/>

## Install

```bash
npm install --save-dev vite-register
```

## Features

Pretty much [like Vite does](https://vitejs.dev/guide/env-and-mode.html#production-replacement), vite-register will statically replace variables.

- [x] Support `import.meta.env.MODE`
- [x] Support `import.meta.env.DEV`
- [x] Support `import.meta.env.PROD`
- [ ] Support `import.meta.env.SSR` (defaults to `false`)
- [x] Support `import.meta.env.BASE_URL`
- [x] Support loading variables
  - [x] from a `.env` file
  - [x] from a `.env.local` file
  - [x] from a `.env.[mode]` file
  - [x] from a `.env.[mode].local` file
- [x] Support `<UserConfig>.envPrefix` (defaults to `VITE_`)
- [x] Support `<UserConfig>.envDir` (defaults to project root)

## Usage

This hook can be used with the Node CLI and some test runners supporting hooks via the `-r` (`--require`) option.

```bash
# Assuming envPrefix => 'VITE_'
echo 'VITE_FOO="hello world"' > .env
echo 'console.log(import.meta.env.VITE_FOO);' > index.js
node -r vite-register index.js
> hello world
```

vite-register can look into Vite configuration files (`vite.config.[ext]`) and retrieve [`base`](https://vitejs.dev/config/#base) and [`mode`](https://vitejs.dev/config/#mode).

In most cases, TypeScript/JSX/ESM support in configuration files and scripts can be provided by third-party hooks like [tsm](https://github.com/lukeed/tsm), [esbuild-runner](https://github.com/folke/esbuild-runner) or [esbuild-register](https://github.com/egoist/esbuild-register), before vite-register hook.

```bash
node -r esbuild-runner/register -r vite-register index.ts
```

### Mocha

?????? <a href="https://github.com/mochajs/mocha">mochajs/mocha</a>

Can be combined with [esbuild-runner](https://github.com/folke/esbuild-runner) for TypeScript/JSX/ESM support.

```bash
mocha -r esbuild-runner/register -r vite-register [pattern]
```

### uvu

?????? <a href="https://github.com/lukeed/uvu">lukeed/uvu</a>

Can be combined with [tsm](https://github.com/lukeed/tsm) or [esbuild-runner](https://github.com/folke/esbuild-runner) for TypeScript/JSX/ESM support.

```bash
uvu -r tsm -r vite-register [pattern]
```

## FAQ

### When should I use vite-register over [Vitest](https://github.com/vitest-dev/vitest), or vice-versa ?

- If you want a test framework, **use Vitest**.
- If you need Jest features (snapshot, mocking, etc.), **use Vitest**.
- If package size [really matters](https://packagephobia.com/result?p=vitest%2C+vite-register), **use vite-register**.
- If you want something actively maintained by Vite members, **use Vitest**.
- If migrating tests becomes an issue, **use vite-register**.
- If you _really_ can't upgrade to Node >=v14, **use vite-register**.

### Support Jest ?

Jest currently doesn't support hooks ([facebook/jest#11295](https://github.com/facebook/jest/issues/11295)). If you need Jest unique features, you're better off switching to [Vitest](https://github.com/vitest-dev/vitest).

## License

MIT 
