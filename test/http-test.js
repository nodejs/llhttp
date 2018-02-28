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
          'off=58 headers complete'
        ].join('\n') + '\n';

        url(req, expected, callback);
      });
    });
  });
});
