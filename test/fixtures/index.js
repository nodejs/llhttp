'use strict';

const path = require('path');
const fs = require('fs');
const llhttp = require('../../');

const BUILD_DIR = path.join(__dirname, '..', 'tmp');
const CHEADERS_FILE = path.join(BUILD_DIR, 'cheaders.h');

const cheaders = new llhttp.CHeaders().build();
fs.writeFileSync(CHEADERS_FILE, cheaders);

const fixture = require('llparse-test-fixture').create({
  buildDir: BUILD_DIR,
  extra: [
    '-DLLPARSE__ERROR_PAUSE=' + llhttp.constants.ERROR.PAUSED,
    '-include', CHEADERS_FILE,
    path.join(__dirname, 'extra.c')
  ]
});

exports.build = (...args) => fixture.build(...args);

// For CI
exports.TIMEOUT = 10000;
