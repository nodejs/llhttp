import * as assert from 'assert';
import * as fs from 'fs';
import { LLParse } from 'llparse';
import { Group, MDGator, Metadata, Test } from 'mdgator';
import * as path from 'path';

import * as llhttp from '../src/llhttp';
import { build, FixtureResult, TestType } from './fixtures';

//
// Cache nodes/llparse instances ahead of time
// (different types of tests will re-use them)
//

function buildNode(mode: llhttp.HTTPMode) {
  const p = new LLParse();
  const instance = new llhttp.HTTP(p, mode);

  return { llparse: p, entry: instance.build().entry };
}

const httpNode = {
  loose: buildNode('loose'),
  strict: buildNode('strict'),
};

//
// Build binaries using cached nodes/llparse
//

function buildMode(mode: llhttp.HTTPMode, ty: TestType): FixtureResult {
  const node = httpNode[mode];

  return build(node.llparse, node.entry, `http-${mode}-${ty}`, {
    extra: [
      '-DHTTP_PARSER__TEST_HTTP',
      path.join(__dirname, '..', 'src', 'native', 'http.c'),
    ],
  }, ty);
}

interface IFixtureMap {
  [key: string]: { [key: string]: FixtureResult };
}

const http: IFixtureMap = {
  loose: {
    none: buildMode('loose', 'none'),
    request: buildMode('loose', 'request'),
    response: buildMode('loose', 'response'),
  },
  strict: {
    none: buildMode('strict', 'none'),
    request: buildMode('strict', 'request'),
    response: buildMode('strict', 'response'),
  },
};

//
// Run test suite
//

function run(name: string): void {
  const md = new MDGator();

  const raw = fs.readFileSync(path.join(__dirname, name + '.md')).toString();
  const groups = md.parse(raw);

  function runSingleTest(mode: llhttp.HTTPMode, ty: TestType, meta: any,
                         input: string, expected: ReadonlyArray<string>): void {
    it(`should pass in mode="${mode}" and for type="${ty}"`, async () => {
      await http[mode][ty].check(input, expected, {
        noScan: meta.noScan === true,
      });
    });
  }

  function runTest(test: Test) {
    describe(test.name + ` at ${name}.md:${test.line + 1}`, () => {
      let modes: llhttp.HTTPMode[] = [ 'strict', 'loose' ];
      let types: TestType[] = [ 'none' ];

      assert(test.values.has('http'), 'Missing `http` code in md file');
      assert(test.values.has('log'), 'Missing `log` code in md file');

      assert.strictEqual(test.values.get('http')!.length, 1,
        'Expected just one request');
      assert.strictEqual(test.values.get('log')!.length, 1,
        'Expected just one output');

      assert(test.meta.has('http'), 'Missing required metadata');
      const meta: Metadata = test.meta.get('http')![0]!;

      assert(meta.hasOwnProperty('type'), 'Missing required `type` metadata');
      if (meta.type === 'request') {
        types.push('request');
      } else if (meta.type === 'response') {
        types.push('response');
      } else if (meta.type === 'request-only') {
        types = [ 'request' ];
      } else if (meta.type === 'response-only') {
        types = [ 'response' ];
      } else {
        throw new Error(`Invalid value of \`type\` metadata: "${meta.type}"`);
      }

      if (meta.mode === 'strict') {
        modes = [ 'strict' ];
      } else if (meta.mode === 'loose') {
        modes = [ 'loose' ];
      } else {
        assert(!meta.hasOwnProperty('mode'),
          `Invalid value of \`mode\` metadata: "${meta.mode}"`);
      }

      let req: string = test.values.get('http')![0];
      let expected: string = test.values.get('log')![0];

      // Remove trailing newline
      req = req.replace(/\n$/, '');

      // Normalize all newlines
      req = req.replace(/\r\n|\r|\n/g, '\r\n');

      // Replace escaped CRLF and tabs
      req = req.replace(/\\r/g, '\r');
      req = req.replace(/\\n/g, '\n');
      req = req.replace(/\\t/g, '\t');

      // Replace escaped tabs in expected too
      expected = expected.replace(/\\t/g, '\t');

      modes.forEach((mode) => {
        types.forEach((ty) => {
          runSingleTest(mode, ty, meta, req,
            expected.split(/\n/g).slice(0, -1));
        });
      });
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

run('request-test');
run('response-test');
