#!/usr/bin/env -S npx ts-node

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { LLParse } from 'llparse';
import { dirname, resolve } from 'path';
import { parse } from 'semver';
import { CHeaders, HTTP } from '../src/llhttp';

const C_FILE = resolve(__dirname, '../build/c/llhttp.c');
const HEADER_FILE = resolve(__dirname, '../build/llhttp.h');

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json')).toString(),
);
const version = parse(pkg.version)!;
const llparse = new LLParse('llhttp__internal');

const cHeaders = new CHeaders();
const nativeHeaders = readFileSync(resolve(__dirname, '../src/native/api.h'));
const generated = llparse.build(new HTTP(llparse).build().entry, {
  c: {
    header: 'llhttp',
  },
  debug: process.env.LLPARSE_DEBUG ? 'llhttp__debug' : undefined,
  headerGuard: 'INCLUDE_LLHTTP_ITSELF_H_',
});

const headers = `
#ifndef INCLUDE_LLHTTP_H_
#define INCLUDE_LLHTTP_H_

#define LLHTTP_VERSION_MAJOR ${version.major}
#define LLHTTP_VERSION_MINOR ${version.minor}
#define LLHTTP_VERSION_PATCH ${version.patch}

${generated.header}

${cHeaders.build()}

${nativeHeaders}

#endif  /* INCLUDE_LLHTTP_H_ */
`;

mkdirSync(dirname(C_FILE), { recursive: true });
writeFileSync(HEADER_FILE, headers);
writeFileSync(C_FILE, generated.c);
