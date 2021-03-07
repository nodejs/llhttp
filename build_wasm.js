'use strict'

const { mkdirSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')
const { join } = require('path')
const js = require('javascript-stringify')
const { WASI_ROOT } = process.env

if (process.argv[2] === '--setup') {
  try {
    mkdirSync(join(__dirname, 'build'))
    process.exit(0);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
    process.exit(0);
  }
}

if (process.argv[2] === '--docker') {
  let cmd = 'docker run --rm -it'; 
  if (process.platform === 'linux') {
    cmd += ` --user ${process.getuid()}:${process.getegid()}`;
  }
  cmd += ` --mount type=bind,source=${__dirname}/build,target=/home/node/llhttp/build llhttp_wasm_builder node build_wasm.js`;
  execSync(cmd, { stdio: 'inherit' });
  process.exit(0);
}

if (!WASI_ROOT) {
  throw new Error('Please setup the WASI_ROOT env variable.')
}

const WASM_OUT = join(__dirname, 'build', 'wasm')

try {
  mkdirSync(WASM_OUT)
} catch (error) {
  if (error.code !== 'EEXIST') {
    throw error
  }
}

// Build ts
execSync('npm run build', { stdio: 'inherit' })

// Build wasm binary
execSync(`${WASI_ROOT}/bin/clang \
 --sysroot=${WASI_ROOT}/share/wasi-sysroot \
 -target wasm32-unknown-wasi \
 -Ofast \
 -fno-exceptions \
 -fvisibility=hidden \
 -mexec-model=reactor \
 -Wl,-error-limit=0 \
 -Wl,-O3 \
 -Wl,--lto-O3 \
 -Wl,--strip-all \
 -Wl,--allow-undefined \
 -Wl,--export-dynamic \
 -Wl,--export-table \
 -Wl,--export=malloc \
 -Wl,--export=free \
 ${join(__dirname, 'build', 'c')}/*.c \
 ${join(__dirname, 'src', 'native')}/*.c \
 -I${join(__dirname, 'build')} \
 -o ${join(WASM_OUT, 'llhttp.wasm')}`, { stdio: 'inherit' })

// Build `constants.js` file
const { constants } = require('.')
const data = `module.exports = ${js.stringify(constants)}`
writeFileSync(join(WASM_OUT, 'constants.js'), data, 'utf8')
