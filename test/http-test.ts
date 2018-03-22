import { LLParse } from 'llparse';
import * as path from 'path';

import * as llhttp from '../src/llhttp';
import { build, FixtureResult } from './fixtures';

const MODES: ReadonlyArray<llhttp.HTTPMode> = [ 'strict', 'loose' ];

describe('http_parser/http', () => {
  const test = (mode: llhttp.HTTPMode): void => {
    let http: FixtureResult;
    before(() => {
      const p = new LLParse();
      const instance = new llhttp.HTTP(p, mode);

      const result = instance.build();

      http = build(p, result.entry, 'http-req-' + mode, {
        extra: [
          '-DHTTP_PARSER__TEST_HTTP',
          path.join(__dirname, '..', 'src', 'native', 'http.c'),
        ],
      });
    });

    describe('content-length', () => {
      it('should parse content-length with follow-up header', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Content-Length: 003\r\n' +
          'Ohai: world\r\n' +
          '\r\n' +
          'abc';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=3 span[header_value]="003"',
          'off=40 len=4 span[header_field]="Ohai"',
          'off=46 len=5 span[header_value]="world"',
          'off=55 headers complete method=4 v=1/1 flags=20 content_length=3',
          'off=55 len=3 span[body]="abc"',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      it('should handle content-length overflow', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Content-Length: 1000000000000000000000\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=21 span[header_value]="100000000000000000000"',
          'off=56 error code=11 reason="Content-Length overflow"',
        ];

        await http.check(req, expected);
      });

      it('should handle duplicate content-length', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Content-Length: 1\r\n' +
          'Content-Length: 2\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=1 span[header_value]="1"',
          'off=38 len=14 span[header_field]="Content-Length"',
          'off=54 error code=4 reason="Duplicate Content-Length"',
        ];

        await http.check(req, expected);
      });
    });

    describe('transfer-encoding', () => {
      it('should parse `transfer-encoding: chunked`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="chunked"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=8 content_length=0',
        ];

        await http.check(req, expected);
      });

      it('should ignore `transfer-encoding: pigeons`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Transfer-Encoding: pigeons\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="pigeons"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=0 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });
    });

    describe('connection', () => {
      it('should parse `connection: keep-alive`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=10 span[header_value]="keep-alive"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=1 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      it('should parse `connection: close`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: close\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=5 span[header_value]="close"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=2 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      it('should parse `connection: upgrade`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: upgrade\r\n' +
          'Upgrade: ws\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=7 span[header_value]="upgrade"',
          'off=40 len=7 span[header_field]="Upgrade"',
          'off=49 len=2 span[header_value]="ws"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=14 content_length=0',
          `off=${req.length} message complete`,
          `off=${req.length} error code=21 reason="pause on CONNECT/Upgrade"`,
        ];

        await http.check(req, expected);
      });

      it('should pause on upgrade with body', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: upgrade\r\n' +
          'Content-Length: 4\r\n' +
          'Upgrade: ws\r\n' +
          '\r\n' +
          'abcdefgh';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=7 span[header_value]="upgrade"',
          'off=40 len=14 span[header_field]="Content-Length"',
          'off=56 len=1 span[header_value]="4"',
          'off=59 len=7 span[header_field]="Upgrade"',
          'off=68 len=2 span[header_value]="ws"',
          'off=74 headers complete method=4 v=1/1 flags=34 content_length=4',
          'off=74 len=4 span[body]="abcd"',
          'off=78 message complete',
          'off=78 error code=21 reason="pause on CONNECT/Upgrade"',
        ];

        await http.check(req, expected);
      });

      it('should parse `connection: tokens`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: close, token, upgrade, token, keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=40 span[header_value]="close, token, upgrade, token, ' +
            'keep-alive"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=7 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });
    });

    it('should not allow content-length with chunked', async () => {
      const req =
        'PUT /url HTTP/1.1\r\n' +
        'Content-Length: 1\r\n' +
        'Transfer-Encoding: chunked\r\n' +
        '\r\n';

      const expected = [
        'off=0 message begin',
        'off=4 len=4 span[url]="/url"',
        'off=19 len=14 span[header_field]="Content-Length"',
        'off=35 len=1 span[header_value]="1"',
        'off=38 len=17 span[header_field]="Transfer-Encoding"',
        'off=57 len=7 span[header_value]="chunked"',
        `off=${req.length} error code=4 reason="Content-Length can't ` +
          'be present with chunked encoding"',
      ];

      await http.check(req, expected);
    });

    describe('keep-alive', () => {
      it('should restart request when keep-alive is on', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: keep-alive\r\n' +
          '\r\n' +
          '\r\n' +
          'PUT /url HTTP/1.1\r\n' +
          'Connection: keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=10 span[header_value]="keep-alive"',
          'off=45 headers complete method=4 v=1/1 flags=1 content_length=0',
          'off=45 message complete',
          'off=47 message begin',
          'off=51 len=4 span[url]="/url"',
          'off=66 len=10 span[header_field]="Connection"',
          'off=78 len=10 span[header_value]="keep-alive"',
          'off=92 headers complete method=4 v=1/1 flags=1 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      if (mode === 'strict') {
        it('should not restart request when keep-alive is off', async () => {
          const req =
            'PUT /url HTTP/1.0\r\n' +
            '\r\n' +
            'PUT /url HTTP/1.1\r\n' +
            '\r\n';

          const expected = [
            'off=0 message begin',
            'off=4 len=4 span[url]="/url"',
            'off=21 headers complete method=4 v=1/0 flags=0 content_length=0',
            'off=21 message complete',
            'off=22 error code=5 reason="Data after `Connection: close`"',
          ];

          await http.check(req, expected);
        });
      } else {
        it('should still reset flags when keep-alive is off', async () => {
          const req =
            'PUT /url HTTP/1.0\r\n' +
            'Content-Length: 0\r\n' +
            '\r\n' +
            'PUT /url HTTP/1.1\r\n' +
            'Transfer-Encoding: chunked\r\n' +
            '\r\n';

          const expected = [
            'off=0 message begin',
            'off=4 len=4 span[url]="/url"',
            'off=19 len=14 span[header_field]="Content-Length"',
            'off=35 len=1 span[header_value]="0"',
            'off=40 headers complete method=4 v=1/0 flags=20 content_length=0',
            'off=40 message complete',
            'off=40 message begin',
            'off=44 len=4 span[url]="/url"',
            'off=59 len=17 span[header_field]="Transfer-Encoding"',
            'off=78 len=7 span[header_value]="chunked"',
            'off=89 headers complete method=4 v=1/1 flags=8 content_length=0',
          ];

          await http.check(req, expected);
        });
      }
    });

    describe('chunked encoding', () => {
      it('should parse chunks with lowercase size', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          '\r\n' +
          'a\r\n' +
          '0123456789\r\n' +
          '0\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="chunked"',
          'off=49 headers complete method=4 v=1/1 flags=8 content_length=0',
          'off=52 chunk header len=10',
          'off=52 len=10 span[body]="0123456789"',
          'off=64 chunk complete',
          'off=67 chunk header len=0',
          `off=${req.length} chunk complete`,
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      it('should parse chunks with uppercase size', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          '\r\n' +
          'A\r\n' +
          '0123456789\r\n' +
          '0\r\n' +
          '\r\n';

        const expected = [
          'off=0 message begin',
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="chunked"',
          'off=49 headers complete method=4 v=1/1 flags=8 content_length=0',
          'off=52 chunk header len=10',
          'off=52 len=10 span[body]="0123456789"',
          'off=64 chunk complete',
          'off=67 chunk header len=0',
          `off=${req.length} chunk complete`,
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });
    });
  };

  MODES.forEach((mode) => {
    describe(mode, () => test(mode));
  });
});
