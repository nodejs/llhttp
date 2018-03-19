import { LLParse } from 'llparse';

import * as llhttp from '../src/llhttp';
import { build, FixtureResult } from './fixtures';

const MODES: ReadonlyArray<llhttp.HTTPMode> = [ 'strict', 'loose' ];

describe('http_parser/url', () => {
  MODES.forEach((mode) => {
    let url: FixtureResult;

    before(() => {
      const p = new LLParse();

      const instance = new llhttp.URL(p, mode);

      const result = instance.build();

      // Loop
      result.exit.toHTTP.otherwise(result.entry.normal);
      result.exit.toHTTP09.otherwise(result.entry.normal);

      url = build(p, result.entry.normal, 'url-' + mode);
    });

    describe(mode, () => {
      it('should parse absolute url', async () => {
        const input = 'http://example.com/path?query=value#schema';
        await url.check(input,
          `off=0 len=${input.length} span[url]="${input}"\n`);
      });

      it('should parse relative url', async () => {
        const input = '/path?query=value#schema';
        await url.check(input,
          `off=0 len=${input.length} span[url]="${input}"\n`);
      });

      it('should fail on broken schema', async () => {
        const input = 'schema:/path?query=value#schema';
        await url.check(
          input,
          /off=8 error code=7 reason="Unexpected char in url schema"\n/g);
      });
    });
  });
});
