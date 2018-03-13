'use strict';
/* globals describe it before */

const llparse = require('llparse');
const fixtures = require('./fixtures');

const http = require('../');

describe('http_parser/http', function() {
  this.timeout(fixtures.TIMEOUT);

  const test = (mode) => {
    let url;
    before(() => {
      const p = llparse.create();

      const instance = new http.HTTP(p, mode === 'strict');

      const result = instance.build();

      // Loop
      result.exit.restart.otherwise(result.entry.req);

      url = fixtures.build(p, result.entry.req, 'http-req-' + mode, {
        extra: [ '-DHTTP_PARSER__TEST_HTTP' ]
      });
    });

    it('should parse simple request', (callback) => {
      const req =
        'OPTIONS /url HTTP/1.1\r\n' +
        'Header1: Value1\r\n' +
        'Header2:\t Value2\r\n' +
        '\r\n';

      const expected = [
        'off=8 len=4 span[url]="/url"',
        'off=23 len=7 span[header_field]="Header1"',
        'off=32 len=6 span[header_value]="Value1"',
        'off=40 len=7 span[header_field]="Header2"',
        'off=50 len=6 span[header_value]="Value2"',
        'off=58 headers complete method=6 v=1/1 flags=0 content_length=0'
      ];

      url(req, expected, callback);
    });

    describe('content-length', () => {
      it('should parse content-length', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Content-Length: 123\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=3 span[header_value]="123"',
          'off=40 headers complete method=1 v=1/1 flags=20 content_length=123'
        ];

        url(req, expected, callback);
      });

      it('should handle content-length overflow', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Content-Length: 1000000000000000000000\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=21 span[header_value]="100000000000000000000"',
          'off=56 error code=9 reason="Content-Length overflow"'
        ];

        url(req, expected, callback);
      });

      it('should handle duplicate content-length', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Content-Length: 1\r\n' +
          'Content-Length: 2\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=1 span[header_value]="1"',
          'off=38 len=14 span[header_field]="Content-Length"',
          'off=54 error code=10 reason="Duplicate Content-Length"'
        ];

        url(req, expected, callback);
      });
    });

    describe('transfer-encoding', () => {
      it('should parse `transfer-encoding: chunked`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="chunked"',
          'off=47 headers complete method=1 v=1/1 flags=8 content_length=0'
        ];

        url(req, expected, callback);
      });

      it('should ignore `transfer-encoding: pigeons`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Transfer-Encoding: pigeons\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="pigeons"',
          'off=47 headers complete method=1 v=1/1 flags=0 content_length=0'
        ];

        url(req, expected, callback);
      });
    });

    describe('connection', () => {
      it('should parse `connection: keep-alive`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Connection: keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=10 span[header_value]="keep-alive"',
          'off=43 headers complete method=1 v=1/1 flags=1 content_length=0'
        ];

        url(req, expected, callback);
      });

      it('should parse `connection: close`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Connection: close\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=5 span[header_value]="close"',
          'off=38 headers complete method=1 v=1/1 flags=2 content_length=0'
        ];

        url(req, expected, callback);
      });

      it('should parse `connection: upgrade`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Connection: upgrade\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=7 span[header_value]="upgrade"',
          'off=40 headers complete method=1 v=1/1 flags=4 content_length=0'
        ];

        url(req, expected, callback);
      });

      it('should parse `connection: tokens`', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Connection: close, token, upgrade, token, keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=40 span[header_value]="close, token, upgrade, token, ' +
            'keep-alive"',
          'off=73 headers complete method=1 v=1/1 flags=7 content_length=0'
        ];

        url(req, expected, callback);
      });
    });

    it('should not allow content-length with chunked', (callback) => {
      const req =
        'GET /url HTTP/1.1\r\n' +
        'Content-Length: 1\r\n' +
        'Transfer-Encoding: chunked\r\n' +
        '\r\n';

      const expected = [
        'off=4 len=4 span[url]="/url"',
        'off=19 len=14 span[header_field]="Content-Length"',
        'off=35 len=1 span[header_value]="1"',
        'off=38 len=17 span[header_field]="Transfer-Encoding"',
        'off=57 len=7 span[header_value]="chunked"',
        'off=66 error code=10 reason="Content-Length can\'t ' +
          'be present with chunked encoding"'
      ];

      url(req, expected, callback);
    });
  };

  [
    'loose',
    'strict'
  ].forEach((mode) => {
    describe(mode, () => test(mode));
  });
});
