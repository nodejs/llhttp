#!/usr/bin/env node
'use strict';

const p = require('llparse').create('http_parser');

const llhttp = require('../');

process.stdout.write(p.build(llhttp.http(p)));
