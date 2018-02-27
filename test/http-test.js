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

        url(req, '', callback);
      });
    });
  });
});
