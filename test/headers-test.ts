import assert from 'node:assert';
import { describe, test } from 'node:test';

import { CHeaders, constants } from '../src/llhttp';

describe('CHeaders method count', () => {
  test('HTTP_ALL_METHOD_COUNT is one past the highest method id', () => {
    const headers = new CHeaders().build();
    const maxId = Math.max(...Object.values(constants.METHODS));
    const match = headers.match(/#define HTTP_ALL_METHOD_COUNT (\d+)/);
    assert.ok(match);
    assert.strictEqual(Number(match[1]), maxId + 1);
  });

  test('every METHODS id is in [0, HTTP_ALL_METHOD_COUNT)', () => {
    const headers = new CHeaders().build();
    const match = headers.match(/#define HTTP_ALL_METHOD_COUNT (\d+)/);
    assert.ok(match);
    const count = Number(match[1]);
    for (const id of Object.values(constants.METHODS)) {
      assert.ok(id >= 0 && id < count);
    }
  });

  test('HTTP_ALL_METHOD_MAP includes QUERY so a hardcoded 46 would miss it', () => {
    const headers = new CHeaders().build();
    assert.match(headers, /XX\(46, QUERY, QUERY\)/);
    const match = headers.match(/#define HTTP_ALL_METHOD_COUNT (\d+)/);
    assert.ok(match);
    assert.ok(Number(match[1]) > 46);
  });
});
