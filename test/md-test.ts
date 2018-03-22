import * as assert from 'assert';
import * as fs from 'fs';
import { LLParse } from 'llparse';
import { Group, MDGator, Test } from 'mdgator';
import * as path from 'path';

import * as llhttp from '../src/llhttp';
import { build, FixtureResult, TestMode} from './fixtures';

function run(name: string, httpMode: llhttp.HTTPMode,
             mode: TestMode = 'none'): void {
  const md = new MDGator();

  const raw = fs.readFileSync(path.join(__dirname, name + '.md')).toString();
  const groups = md.parse(raw);

  // Build binary
  const p = new LLParse();
  const instance = new llhttp.HTTP(p, httpMode);

  const result = instance.build();

  const http = build(p, result.entry, `http-req-${httpMode}-${mode}`, {
    extra: [
      '-DHTTP_PARSER__TEST_HTTP',
      path.join(__dirname, '..', 'src', 'native', 'http.c'),
    ],
  }, mode);

  function runTest(test: Test) {
    it(test.name + ` at ${name}.md:${test.line + 1}`, async () => {
      assert(test.values.has('http'), 'Missing `http` code in md file');
      assert(test.values.has('log'), 'Missing `log` code in md file');

      assert.strictEqual(test.values.get('http')!.length, 1,
        'Expected just one request');
      assert.strictEqual(test.values.get('log')!.length, 1,
        'Expected just one output');

      let req: string = test.values.get('http')![0];
      const expected: string = test.values.get('log')![0];

      // Remove all newlines
      req = req.replace(/[\r\n]+/g, '');

      // Replace CRLF and tabs
      req = req.replace(/\\r/g, '\r');
      req = req.replace(/\\n/g, '\n');
      req = req.replace(/\\t/g, '\t');

      await http.check(req, expected.split(/\n/g).slice(0, -1));
    });
  }

  function runGroup(group: Group) {
    describe(group.name + ` at ${name}.md:${group.line + 1}`, () => {
      group.children.forEach((child) => runGroup(child));

      group.tests.forEach((test) => runTest(test));
    });
  }

  groups.forEach((group) => runGroup(group));
}

run('request-test', 'loose', 'request');
run('request-test', 'strict', 'request');
