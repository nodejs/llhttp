'use strict';
/* globals describe it before */

const llparse = require('llparse');
const fixtures = require('./fixtures');

const http = require('../');

describe('http_parser/http', function() {
  this.timeout(fixtures.TIMEOUT);

  [
    'loose',
    'strict'
  ].forEach((mode) => {
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

    describe(mode, () => {
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
          'off=40 finished header',
          'off=40 len=7 span[header_field]="Header2"',
          'off=50 len=6 span[header_value]="Value2"',
          'off=58 finished header',
          'off=58 headers complete method=6 v=1/1 flags=0 content_length=0'
        ];

        url(req, expected, callback);
      });

      it('should parse content-length', (callback) => {
        const req =
          'GET /url HTTP/1.1\r\n' +
          'Content-Length: 123\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=3 span[header_value]="123"',
          'off=40 finished header',
          'off=40 headers complete method=1 v=1/1 flags=0 content_length=123'
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
          'off=56 error code=-9 reason="Content-Length overflow"'
        ];

        url(req, expected, callback);
      });
    });
  });
});
