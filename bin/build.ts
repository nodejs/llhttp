#!/usr/bin/env npx ts-node
import * as fs from 'fs';
import { LLParse } from 'llparse';
import * as path from 'path';

import * as llhttp from '../src/llhttp';

const BUILD_DIR = path.join(__dirname, '..', 'build');
const SRC_DIR = path.join(__dirname, '..', 'src');

const BITCODE_FILE = path.join(BUILD_DIR, 'http_parser.bc');
const HEADER_FILE = path.join(BUILD_DIR, 'http_parser.h');

try {
  fs.mkdirSync(BUILD_DIR);
} catch (e) {
  // no-op
}

const mode = process.argv[2] === 'strict' ? 'strict' : 'loose';

const llparse = new LLParse('http_parser');
const instance = new llhttp.HTTP(llparse, mode);

const artifacts = llparse.build(instance.build().entry, {
  headerGuard: 'INCLUDE_HTTP_PARSER_ITSELF_H_',
});

let headers = '';

const cHeaders = new llhttp.CHeaders();

headers += artifacts.header;
headers += fs.readFileSync(path.join(SRC_DIR, 'native', 'api.h'));
headers += cHeaders.build();

fs.writeFileSync(BITCODE_FILE, artifacts.bitcode);
fs.writeFileSync(HEADER_FILE, headers);
