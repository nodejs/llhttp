'use strict';
/* globals describe it before */

const llparse = require('llparse');
const fixtures = require('./fixtures');

const http = require('../');

describe('http_parser/url', function() {
  this.timeout(fixtures.TIMEOUT);

  [
    'loose',
    'strict'
  ].forEach((mode) => {
    let url;

    before(() => {
      const p = llparse.create();

      const instance = new http.URL(p, mode === 'strict');

      const result = instance.build();

      // Loop
      result.exit.toHTTP.otherwise(result.entry.normal);
      result.exit.toHTTP09.otherwise(result.entry.normal);

      url = fixtures.build(p, result.entry.normal, 'url-' + mode);
    });

    describe(mode, () => {
      it('should parse absolute url', (callback) => {
        const input = 'http://example.com/path?query=value#schema';
        url(input, `off=0 len=${input.length} span[url]="${input}"\n`,
          callback);
      });

      it('should parse relative url', (callback) => {
        const input = '/path?query=value#schema';
        url(input, `off=0 len=${input.length} span[url]="${input}"\n`,
          callback);
      });

      it('should fail on broken schema', (callback) => {
        const input = 'schema:/path?query=value#schema';
        url(
          input,
          /off=8 error code=-3 reason="Unexpected char in url schema"\n/g,
          callback);
      });
    });
  });
});
