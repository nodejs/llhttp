import * as fs from 'fs';
import { LLParse } from 'llparse';
import { Dot } from 'llparse-dot';
import {
  Fixture, FixtureResult, IFixtureBuildOptions,
} from 'llparse-test-fixture';
import * as path from 'path';

import * as llhttp from '../../src/llhttp';

export { FixtureResult };

const BUILD_DIR = path.join(__dirname, '..', 'tmp');
const CHEADERS_FILE = path.join(BUILD_DIR, 'cheaders.h');

const cheaders = new llhttp.CHeaders().build();
try {
  fs.mkdirSync(BUILD_DIR);
} catch (e) {
  // no-op
}
fs.writeFileSync(CHEADERS_FILE, cheaders);

const fixtures = new Fixture({
  buildDir: path.join(__dirname, '..', 'tmp'),
  extra: [
    '-DHTTP_PARSER__TEST',
    '-DLLPARSE__ERROR_PAUSE=' + llhttp.constants.ERROR.PAUSED,
    '-include', CHEADERS_FILE,
    path.join(__dirname, 'extra.c'),
  ],
});

export function build(llparse: LLParse, node: any, outFile: string,
                      options?: IFixtureBuildOptions): FixtureResult {
  const dot = new Dot();
  fs.writeFileSync(path.join(BUILD_DIR, outFile + '.dot'),
    dot.build(node));

  const artifacts = llparse.build(node, {
    debug: process.env.LLPARSE_DEBUG ? 'llparse__debug' : undefined,
  });
  return fixtures.build(artifacts, outFile, options);
}
