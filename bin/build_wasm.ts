import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const WASM_BUILDER_CONTAINER = 'ghcr.io/nodejs/wasm-builder@\
sha256:975f391d907e42a75b8c72eb77c782181e941608687d4d8694c3e9df415a0970' // v0.0.9

const WASM_OUT = resolve(__dirname, '../build/wasm')
const WASM_SRC = resolve(__dirname, '../')

// These are defined by build environment
const WASM_CC = process.env.WASM_CC || 'clang'
let WASM_CFLAGS = process.env.WASM_CFLAGS || '--sysroot=/usr/share/wasi-sysroot -target wasm32-unknown-wasi'
let WASM_LDFLAGS = process.env.WASM_LDFLAGS || ''
const WASM_LDLIBS = process.env.WASM_LDLIBS || ''
const WASM_OPT = process.env.WASM_OPT || './wasm-opt'

// These are relevant for undici and should not be overridden
WASM_CFLAGS += ' -Ofast -fno-exceptions -fvisibility=hidden -mexec-model=reactor'
WASM_LDFLAGS += ' -Wl,-error-limit=0 -Wl,-O3 -Wl,--lto-O3 -Wl,--strip-all'
WASM_LDFLAGS += ' -Wl,--allow-undefined -Wl,--export-dynamic -Wl,--export-table'
WASM_LDFLAGS += ' -Wl,--export=malloc -Wl,--export=free -Wl,--no-entry'

const WASM_OPT_FLAGS = '-O4 --converge --strip-debug --strip-dwarf --strip-producers'

const writeWasmChunk = (path: string, dest: string) => {
  const base64 = readFileSync(join(WASM_OUT, path)).toString('base64')
  writeFileSync(join(WASM_OUT, dest), `'use strict'

const { Buffer } = require('node:buffer')

const wasmBase64 = '${base64}'

let wasmBuffer

Object.defineProperty(module, 'exports', {
  get: () => {
    return wasmBuffer
      ? wasmBuffer
      : (wasmBuffer = Buffer.from(wasmBase64, 'base64'))
  }
})
`)
}

let platform = process.env.WASM_PLATFORM

if (process.argv[2] === '--docker') {
  platform = execSync('docker info -f "{{.OSType}}/{{.Architecture}}"').toString().trim()
  let cmd = `docker run --rm --platform=${platform.toString().trim()} `
  if (process.platform === 'linux') {
    cmd += ` --user ${process.getuid!()}:${process.getegid!()}`
  }

  cmd += ` --mount type=bind,source=${WASM_SRC},target=/home/node/build \
           -t ${WASM_BUILDER_CONTAINER} npm run wasm`
  console.log(`> ${cmd}\n\n`)
  execSync(cmd, { stdio: 'inherit' })
  process.exit(0)
}

const hasApk = (function () {
  try { execSync('command -v apk'); return true } catch { return false }
})()
const hasOptimizer = (function () {
  try { execSync(`${WASM_OPT} --version`); return true } catch { return false }
})()
if (hasApk) {
  // Gather information about the tools used for the build
  const buildInfo = execSync('apk info -v').toString()
  if (!buildInfo.includes('wasi-sdk')) {
    console.log('Failed to generate build environment information')
    process.exit(-1)
  }
  console.log(buildInfo)
}

mkdirSync(WASM_OUT, { recursive: true })

// Build ts
execSync('npm run build', { cwd: WASM_SRC, stdio: 'inherit' });

// Build wasm binary
execSync(`${WASM_CC} ${WASM_CFLAGS} ${WASM_LDFLAGS} \
${join(WASM_SRC, 'build/c')}/*.c \
${join(WASM_SRC, 'src/native')}/*.c \
-I${join(WASM_SRC, 'build')} \
-o ${join(WASM_OUT, 'llhttp.wasm')} \
${WASM_LDLIBS}`, { stdio: 'inherit' })

if (hasOptimizer) {
  execSync(`${WASM_OPT} ${WASM_OPT_FLAGS} \
-o ${join(WASM_OUT, 'llhttp.wasm')} \
${join(WASM_OUT, 'llhttp.wasm')}`, { stdio: 'inherit' })
}
writeWasmChunk('llhttp.wasm', 'llhttp-wasm.js')

// Build wasm simd binary
execSync(`${WASM_CC} ${WASM_CFLAGS} -msimd128 ${WASM_LDFLAGS} \
${join(WASM_SRC, 'build/c')}/*.c \
${join(WASM_SRC, 'src/native')}/*.c \
-I${join(WASM_SRC, 'build')} \
-o ${join(WASM_OUT, 'llhttp_simd.wasm')} \
${WASM_LDLIBS}`, { stdio: 'inherit' })

if (hasOptimizer) {
  execSync(`${WASM_OPT} ${WASM_OPT_FLAGS} --enable-simd \
-o ${join(WASM_OUT, 'llhttp_simd.wasm')} \
${join(WASM_OUT, 'llhttp_simd.wasm')}`, { stdio: 'inherit' })
}
writeWasmChunk('llhttp_simd.wasm', 'llhttp_simd-wasm.js')

// Copy constants for `.js` and `.ts` users.
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.js'), join(WASM_OUT, 'constants.js'))
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.js.map'), join(WASM_OUT, 'constants.js.map'))
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.d.ts'), join(WASM_OUT, 'constants.d.ts'))
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.js'), join(WASM_OUT, 'utils.js'))
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.js.map'), join(WASM_OUT, 'utils.js.map'))
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.d.ts'), join(WASM_OUT, 'utils.d.ts'))