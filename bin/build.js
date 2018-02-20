#!/usr/bin/env node
'use strict';

const p = require('llparse').create('http_parser');

const llhttp = require('../');

const BUILDTYPE = process.env.BUILDTYPE || '';

process.stdout.write(p.build(llhttp.http(p), {
  debug: BUILDTYPE.toLowerCase() === 'debug' ? 'http_parser__debug' : false
}));
