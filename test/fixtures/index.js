'use strict';

const path = require('path');

const fixture = require('llparse-test-fixture').create({
  buildDir: path.join(__dirname, '..', 'tmp'),
  extra: [ path.join(__dirname, 'extra.c') ]
});

exports.build = (...args) => fixture.build(...args);
