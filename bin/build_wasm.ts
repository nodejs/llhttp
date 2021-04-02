import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { stringify } from 'javascript-stringify';
import { join, resolve } from 'path';
import { constants } from '..';

const { WASI_ROOT } = process.env;
const WASM_OUT = resolve(__dirname, '../build/wasm');
const WASM_SRC = resolve(__dirname, '../');

if (process.argv[2] === '--setup') {
  try {
    mkdirSync(join(WASM_SRC, 'build'));
    process.exit(0);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    process.exit(0);
  }
}

if (process.argv[2] === '--docker') {
  let cmd = 'docker run --rm -it';
  // Try to avoid root permission problems on compiled assets
  // when running on linux.
  // It will work flawessly if uid === gid === 1000
  // there will be some warnings otherwise.
  if (process.platform === 'linux') {
    cmd += ` --user ${process.getuid()}:${process.getegid()}`;
  }
  cmd += ` --mount type=bind,source=${WASM_SRC}/build,target=/home/node/llhttp/build llhttp_wasm_builder npm run wasm`;
  execSync(cmd, { cwd: WASM_SRC, stdio: 'inherit' });
  process.exit(0);
}

if (!WASI_ROOT) {
  throw new Error('Please setup the WASI_ROOT env variable.');
}

try {
  mkdirSync(WASM_OUT);
} catch (error) {
  if (error.code !== 'EEXIST') {
    throw error;
  }
}

// Build ts
execSync('npm run build', { cwd: WASM_SRC, stdio: 'inherit' });

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
 ${join(WASM_SRC, 'build', 'c')}/*.c \
 ${join(WASM_SRC, 'src', 'native')}/*.c \
 -I${join(WASM_SRC, 'build')} \
 -o ${join(WASM_OUT, 'llhttp.wasm')}`, { stdio: 'inherit' });

// Copy constants for `.js` and `.ts` users.
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.js'), join(WASM_OUT, 'constants.js'));
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.js.map'), join(WASM_OUT, 'constants.js.map'));
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'constants.d.ts'), join(WASM_OUT, 'constants.d.ts'));
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.js'), join(WASM_OUT, 'utils.js'));
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.js.map'), join(WASM_OUT, 'utils.js.map'));
copyFileSync(join(WASM_SRC, 'lib', 'llhttp', 'utils.d.ts'), join(WASM_OUT, 'utils.d.ts'));
