'use strict';
/* globals describe it before */

const llparse = require('llparse');
const fixtures = require('./fixtures');

const http = require('../');

describe('http_parser/url', () => {
  [
    'loose',
    'strict'
  ].forEach((mode) => {
    let url;

    before(() => {
      const p = llparse.create();

      const result = http.url(p, mode === 'strict');

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
    });
  });
});
