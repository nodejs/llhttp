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

function buildURL(mode: llhttp.HTTPMode) {
  const p = new LLParse();
  const instance = new llhttp.URL(p, mode, true);

  const node = instance.build();

  // Loop
  node.exit.toHTTP.otherwise(node.entry.normal);
  node.exit.toHTTP09.otherwise(node.entry.normal);

  return { llparse: p, entry: node.entry.normal };
}

const urlNode = {
  loose: buildURL('loose'),
  strict: buildURL('strict'),
};

//
// Build binaries using cached nodes/llparse
//

function buildMode(mode: llhttp.HTTPMode, ty: TestType): FixtureResult {
  let node;
  let prefix: string;
  let extra: ReadonlyArray<string>;
  if (ty === 'url') {
    node = urlNode[mode];
    prefix = 'url';
    extra = [];
  } else {
    node = httpNode[mode];
    prefix = 'http';
    extra = [
      '-DHTTP_PARSER__TEST_HTTP',
      path.join(__dirname, '..', 'src', 'native', 'http.c'),
    ];
  }

  return build(node.llparse, node.entry, `${prefix}-${mode}-${ty}`, {
    extra,
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
    url: buildMode('loose', 'url'),
  },
  strict: {
    none: buildMode('strict', 'none'),
    request: buildMode('strict', 'request'),
    response: buildMode('strict', 'response'),
    url: buildMode('strict', 'url'),
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
                         input: string,
                         expected: ReadonlyArray<string | RegExp>): void {
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

      const isURL = test.values.has('url');
      const inputKey = isURL ? 'url' : 'http';

      assert(test.values.has(inputKey),
        `Missing "${inputKey}" code in md file`);
      assert.strictEqual(test.values.get(inputKey)!.length, 1,
        `Expected just one "${inputKey}" input`);

      let meta: Metadata;
      if (test.meta.has(inputKey)) {
        meta = test.meta.get(inputKey)![0]!;
      } else {
        assert(isURL, 'Missing required http metadata');
        meta = {};
      }

      if (isURL) {
        types = [ 'url' ];
      } else {
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
      }

      assert(test.values.has('log'), 'Missing `log` code in md file');

      assert.strictEqual(test.values.get('log')!.length, 1,
        'Expected just one output');

      if (meta.mode === 'strict') {
        modes = [ 'strict' ];
      } else if (meta.mode === 'loose') {
        modes = [ 'loose' ];
      } else {
        assert(!meta.hasOwnProperty('mode'),
          `Invalid value of \`mode\` metadata: "${meta.mode}"`);
      }

      let input: string = test.values.get(inputKey)![0];
      let expected: string = test.values.get('log')![0];

      // Remove trailing newline
      input = input.replace(/\n$/, '');

      // Remove escaped newlines
      input = input.replace(/\\(\r\n|\r|\n)/g, '');

      // Normalize all newlines
      input = input.replace(/\r\n|\r|\n/g, '\r\n');

      // Replace escaped CRLF, tabs, form-feed
      input = input.replace(/\\r/g, '\r');
      input = input.replace(/\\n/g, '\n');
      input = input.replace(/\\t/g, '\t');
      input = input.replace(/\\f/g, '\f');

      // Replace escaped tabs/form-feed in expected too
      expected = expected.replace(/\\t/g, '\t');
      expected = expected.replace(/\\f/g, '\f');

      // Split
      const expectedLines = expected.split(/\n/g).slice(0, -1);

      const fullExpected = expectedLines.map((line) => {
        if (line.startsWith('/')) {
          return new RegExp(line.trim().slice(1, -1));
        } else {
          return line;
        }
      });

      modes.forEach((mode) => {
        types.forEach((ty) => {
          runSingleTest(mode, ty, meta, input, fullExpected);
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

run('request/sample');
run('request/method');
run('request/uri');
run('request/connection');
run('request/content-length');
run('request/transfer-encoding');

run('response/sample');
run('response/connection');
run('response/content-length');
run('response/transfer-encoding');

run('url');
