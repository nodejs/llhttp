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

    it('should parse simple request', async () => {
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
        `off=${req.length} headers complete method=6 v=1/1 ` +
          'flags=0 content_length=0',
        `off=${req.length} message complete`,
      ];

      await http.check(req, expected);
    });

    it('should parse simple response', async () => {
      const req =
        'HTTP/1.1 200 OK\r\n' +
        'Header1: Value1\r\n' +
        'Header2:\t Value2\r\n' +
        'Content-Length: 0\r\n' +
        '\r\n';

      const expected = [
        'off=13 len=2 span[status]="OK"',
        'off=17 len=7 span[header_field]="Header1"',
        'off=26 len=6 span[header_value]="Value1"',
        'off=34 len=7 span[header_field]="Header2"',
        'off=44 len=6 span[header_value]="Value2"',
        'off=52 len=14 span[header_field]="Content-Length"',
        'off=68 len=1 span[header_value]="0"',
        `off=${req.length} headers complete status=200 v=1/1 ` +
          'flags=20 content_length=0',
        `off=${req.length} message complete`,
      ];

      await http.check(req, expected);
    });

    describe('content-length', () => {
      it('should parse content-length', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Content-Length: 003\r\n' +
          '\r\n' +
          'abc';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=14 span[header_field]="Content-Length"',
          'off=35 len=3 span[header_value]="003"',
          'off=42 headers complete method=4 v=1/1 flags=20 content_length=3',
          'off=42 len=3 span[body]="abc"',
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
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=7 span[header_value]="upgrade"',
          'off=40 len=7 span[header_field]="Upgrade"',
          'off=49 len=2 span[header_value]="ws"',
          `off=${req.length} headers complete method=4 v=1/1 ` +
            'flags=14 content_length=0',
          `off=${req.length} message complete`,
          `off=${req.length} pause`,
        ];

        await http.check(req, expected);
      });

      it('should parse `connection: tokens`', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Connection: close, token, upgrade, token, keep-alive\r\n' +
          '\r\n';

        const expected = [
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
          'PUT /url HTTP/1.1\r\n' +
          'Connection: keep-alive\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=10 span[header_field]="Connection"',
          'off=31 len=10 span[header_value]="keep-alive"',
          'off=45 headers complete method=4 v=1/1 flags=1 content_length=0',
          'off=45 message complete',
          'off=49 len=4 span[url]="/url"',
          'off=64 len=10 span[header_field]="Connection"',
          'off=76 len=10 span[header_value]="keep-alive"',
          'off=90 headers complete method=4 v=1/1 flags=1 content_length=0',
          `off=${req.length} message complete`,
        ];

        await http.check(req, expected);
      });

      it('should not restart request when keep-alive is off', async () => {
        const req =
          'PUT /url HTTP/1.0\r\n' +
          '\r\n' +
          'PUT /url HTTP/1.1\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=21 headers complete method=4 v=1/0 flags=0 content_length=0',
          'off=21 message complete',
          'off=22 error code=5 reason="Data after `Connection: close`"',
        ];

        await http.check(req, expected);
      });
    });

    describe('chunked encoding', () => {
      it('should parse chunks', async () => {
        const req =
          'PUT /url HTTP/1.1\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          '\r\n' +
          '3\r\n' +
          'abc\r\n' +
          '0\r\n' +
          '\r\n';

        const expected = [
          'off=4 len=4 span[url]="/url"',
          'off=19 len=17 span[header_field]="Transfer-Encoding"',
          'off=38 len=7 span[header_value]="chunked"',
          'off=49 headers complete method=4 v=1/1 flags=8 content_length=0',
          'off=52 chunk header len=3',
          'off=52 len=3 span[body]="abc"',
          'off=57 chunk complete',
          'off=60 chunk header len=0',
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
