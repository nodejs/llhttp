#!/usr/bin/env npx ts-node
import * as fs from 'fs';
import { LLParse } from 'llparse';
import * as path from 'path';
import * as semver from 'semver';

import * as llhttp from '../src/llhttp';

const pkgFile = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile).toString());

const BUILD_DIR = path.join(__dirname, '..', 'build');
const BITCODE_DIR = path.join(BUILD_DIR, 'bitcode');
const C_DIR = path.join(BUILD_DIR, 'c');
const SRC_DIR = path.join(__dirname, '..', 'src');

const BITCODE_FILE = path.join(BITCODE_DIR, 'http_parser.bc');
const C_FILE = path.join(C_DIR, 'http_parser.c');
const HEADER_FILE = path.join(BUILD_DIR, 'http_parser.h');

for (const dir of [ BUILD_DIR, BITCODE_DIR, C_DIR ]) {
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    // no-op
  }
}

const mode = process.argv[2] === 'strict' ? 'strict' : 'loose';

const llparse = new LLParse('http_parser');
const instance = new llhttp.HTTP(llparse, mode);

const artifacts = llparse.build(instance.build().entry, {
  debug: process.env.LLPARSE_DEBUG ? 'http_parser__debug' : undefined,
  headerGuard: 'INCLUDE_HTTP_PARSER_ITSELF_H_',
});

let headers = '';

headers += '#ifndef INCLUDE_HTTP_PARSER_H_\n';
headers += '#define INCLUDE_HTTP_PARSER_H_\n';

headers += '\n';

const version = semver.parse(pkg.version)!;

headers += `#define HTTP_PARSER_VERSION_MAJOR ${version.major}\n`;
headers += `#define HTTP_PARSER_VERSION_MINOR ${version.minor}\n`;
headers += `#define HTTP_PARSER_VERSION_PATCH ${version.patch}\n`;
headers += '\n';

const cHeaders = new llhttp.CHeaders();

headers += artifacts.header;

headers += '\n';

headers += cHeaders.build();

headers += '\n';

headers += fs.readFileSync(path.join(SRC_DIR, 'native', 'api.h'));

headers += '\n';
headers += '#endif  /* INCLUDE_HTTP_PARSER_H_ */\n';

fs.writeFileSync(BITCODE_FILE, artifacts.bitcode);
fs.writeFileSync(C_FILE, artifacts.c);
fs.writeFileSync(HEADER_FILE, headers);
