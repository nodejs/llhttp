'use strict';
// NOTE: run `npm test` to build `./test/tmp/http-req-loose`

const spawnSync = require('child_process').spawnSync;

const isURL = !process.argv[2] || process.argv[2] === 'url';
const isHTTP = !process.argv[2] || process.argv[2] === 'http';

const REQUEST =
  'POST /joyent/http-parser HTTP/1.1\r\n' +
  'Host: github.com\r\n' +
  'DNT: 1\r\n' +
  'Accept-Encoding: gzip, deflate, sdch\r\n' +
  'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4\r\n' +
  'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/39.0.2171.65 Safari/537.36\r\n' +
  'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,' +
      'image/webp,*/*;q=0.8\r\n' +
  'Referer: https://github.com/joyent/http-parser\r\n' +
  'Connection: keep-alive\r\n' +
  'Transfer-Encoding: chunked\r\n' +
  'Cache-Control: max-age=0\r\n\r\n';

if (isURL) {
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
}

if (isHTTP) {
  console.log('http loose');

  spawnSync('./test/tmp/http-req-loose', [
    'bench',
    REQUEST
  ], { stdio: 'inherit' });

  console.log('http strict');

  spawnSync('./test/tmp/http-req-strict', [
    'bench',
    REQUEST
  ], { stdio: 'inherit' });
}
