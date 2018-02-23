#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const p = require('llparse').create('http_parser');

const llhttp = require('../');

const BUILDTYPE = process.env.BUILDTYPE || '';

const artifacts = p.build(llhttp.http(p), {
  debug: BUILDTYPE.toLowerCase() === 'debug' ? 'http_parser__debug' : false
});

const INCLUDE_DIR = path.join(__dirname, '..', 'include');
const BUILD_DIR = path.join(__dirname, '..', 'build');

try {
  fs.mkdirSync(INCLUDE_DIR);
} catch (e) {
  // no-op
}
try {
  fs.mkdirSync(BUILD_DIR);
} catch (e) {
  // no-op
}

fs.writeFileSync(path.join(INCLUDE_DIR, 'http_parser.h'), artifacts.header);
fs.writeFileSync(path.join(BUILD_DIR, 'http_parser.ll'), artifacts.llvm);
