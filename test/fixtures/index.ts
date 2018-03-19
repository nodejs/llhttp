import * as fs from 'fs';
import { LLParse } from 'llparse';
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
  return fixtures.build(llparse.build(node), outFile, options);
}
