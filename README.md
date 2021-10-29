

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
  <p>Require hook allowing to use Vite <a href="https://vitejs.dev/guide/env-and-mode.html">env variables</a> inside Node scripts and tests runners.</p>
</div>
<br/>

## Install

```bash
npm install --save-dev vite-register
```

## Features

Pretty much [like Vite does](https://vitejs.dev/guide/env-and-mode.html#production-replacement), vite-register will statically replace variables.

- [x] Support `import.meta.env.MODE` (based on `process.env.NODE_ENV`, defaults to `development`)
- [x] Support `import.meta.env.DEV`
- [x] Support `import.meta.env.PROD`
- [ ] Support `import.meta.env.SSR` (defaults to `false`)
- [ ] Support `import.meta.env.BASE_URL` (defaults to `/`)
- [x] Support loading variables prefixed with `VITE_`
  - [x] from a `.env` file
  - [x] from a `.env.local` file
  - [x] from a `.env.[mode]` file
  - [x] from a `.env.[mode].local` file

## Usage

This hook can be used with the Node CLI and in some test runners supporting hooks via the `-r` (`--require`) option.

```bash
echo 'VITE_FOO="hello world"' > .env
echo 'console.log(import.meta.env.VITE_FOO);' > index.js
node -r vite-register index.js
> hello world
```

### Mocha

↪️ <a href="https://github.com/mochajs/mocha">mochajs/mocha</a>

Can be combined with [esbuild-runner](https://github.com/folke/esbuild-runner) for TypeScript/ESM support.

```bash
mocha -r esbuild-runner/register -r vite-register [pattern]
```

### uvu

↪️ <a href="https://github.com/lukeed/uvu">lukeed/uvu</a>

Can be combined with [tsm](https://github.com/lukeed/tsm) or [esbuild-runner](https://github.com/folke/esbuild-runner) for TypeScript/ESM support.

```bash
uvu -r tsm -r vite-register [pattern]
```

## License

MIT 
