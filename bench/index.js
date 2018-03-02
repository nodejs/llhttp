'use strict';
// NOTE: run `npm test` to build `./test/tmp/http-req-loose`

const spawnSync = require('child_process').spawnSync;

console.log('url loose');

spawnSync('./test/tmp/url-loose', [
  'bench',
  'http://example.com/path/to/file?query=value#fragment'
], { stdio: 'inherit' });

console.log('url strict');

spawnSync('./test/tmp/url-strict', [
  'bench',
  'http://example.com/path/to/file?query=value#fragment'
], { stdio: 'inherit' });

console.log('http loose');

spawnSync('./test/tmp/http-req-loose', [
  'bench',
  'GET /api/v1/path HTTP/1.1\r\n' +
    'Header: Value\r\n' +
    'Header1: Value1\r\n' +
    'Header2: Value2\r\n' +
    '\r\n'
], { stdio: 'inherit' });

console.log('http strict');

spawnSync('./test/tmp/http-req-strict', [
  'bench',
  'GET /api/v1/path HTTP/1.1\r\n' +
    'Header: Value\r\n' +
    'Header1: Value1\r\n' +
    'Header2: Value2\r\n' +
    '\r\n'
], { stdio: 'inherit' });
