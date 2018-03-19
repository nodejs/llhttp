'use strict';
// NOTE: run `npm test` to build `./test/tmp/http-req-loose`

const spawnSync = require('child_process').spawnSync;

const isURL = !process.argv[2] || process.argv[2] === 'url';
const isHTTP = !process.argv[2] || process.argv[2] === 'http';

const REQUEST =
  'GET /wp-content/uploads/2010/03/hello-kitty-darth-vader-pink.jpg HTTP/1.1\r\n' +
'Host: www.kittyhell.com\r\n' +
'User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; ja-JP-mac; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3 Pathtraq/0.9\r\n' +
'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n' +
'Accept-Language: ja,en-us;q=0.7,en;q=0.3\r\n' +
'Accept-Encoding: gzip,deflate\r\n' +
'Accept-Charset: Shift_JIS,utf-8;q=0.7,*;q=0.7\r\n' +
'Keep-Alive: 115\r\n' +
'Connection: keep-alive\r\n' +
'Cookie: wp_ozh_wsa_visits=2; wp_ozh_wsa_visit_lasttime=xxxxxxxxxx; __utma=xxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.x; __utmz=xxxxxxxxx.xxxxxxxxxx.x.x.utmccn=(referral)|utmcsr=reader.livedoor.com|utmcct=/reader/|utmcmd=referral\r\n\r\n';

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
