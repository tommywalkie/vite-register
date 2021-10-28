#!/usr/bin/env node
import { register } from './';
import process from 'process';
import { spawn } from 'child_process';
import { URL, pathToFileURL } from 'url';

register();
const argv = ['--loader', new URL('require.js', pathToFileURL(__filename)).href, ...process.argv.slice(2)];
spawn('node', argv, { stdio: 'inherit' }).on('exit', process.exit);

