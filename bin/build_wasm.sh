#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/../"

if [[ -z "$WASM_PLATFORM" && -n "$1" ]]; then
    WASM_PLATFORM=$(docker info -f "{{.OSType}}/{{.Architecture}}")
fi

case "$1" in
    --prebuild)
        exec docker build --platform="$WASM_PLATFORM" -t llhttp_wasm_builder . --load
        ;;
    --setup)
        mkdir -p build
        exit 0
        ;;
    --docker)
        cmd=(docker run --rm --platform="$WASM_PLATFORM")
        if [[ -z "$CI" ]]; then
            cmd+=(-it)
        fi
        # Try to avoid root permission problems on compiled assets
        # when running on linux.
        # It will work flawessly if uid === gid === 1000
        # there will be some warnings otherwise.
        if [[ "$(uname)" == Linux ]]; then
            cmd+=(--user "$(id -u):$(id -g)")
        fi
        cmd+=(--mount "type=bind,source=./build,target=/home/node/llhttp/build" llhttp_wasm_builder npm run wasm)

        echo "> ${cmd[*]}"
        exec "${cmd[@]}"
        ;;
esac

out=build/wasm
mkdir -p "$out"

npm run build

# shellcheck disable=SC2054 # the commas are intentional
CFLAGS=(
    --sysroot=/usr/share/wasi-sysroot
    -target wasm32-unknown-wasi
    -Ofast
    -fno-exceptions
    -fvisibility=hidden
    -mexec-model=reactor
    -Wl,-error-limit=0
    -Wl,-O3
    -Wl,--lto-O3
    -Wl,--strip-all
    -Wl,--allow-undefined
    -Wl,--export-dynamic
    -Wl,--export-table
    -Wl,--export=malloc
    -Wl,--export=free
    -Wl,--no-entry
    build/c/*.c
    src/native/*.c
    -Ibuild
)

clang "${CFLAGS[@]}" -mno-bulk-memory -mno-multivalue -mno-relaxed-simd -mno-sign-ext -mno-simd128 -o "$out/llhttp_baseline.wasm"
clang "${CFLAGS[@]}"    -mbulk-memory    -mmultivalue    -mrelaxed-simd    -msign-ext    -msimd128 -o "$out/llhttp_opt.wasm"

js_template="'use strict'
const { Buffer } = require('node:buffer')
const wasmBase64 = '%s'
let wasmBuffer
Object.defineProperty(module, 'exports', {
  get: () => {
    return wasmBuffer
      ? wasmBuffer
      : (wasmBuffer = Buffer.from(wasmBase64, 'base64'))
  }
})
"


# shellcheck disable=SC2059 # I want to use the variable
printf "$js_template" "$(base64 -w0 "$out/llhttp_baseline.wasm")" > "$out/llhttp_baseline.js"
# shellcheck disable=SC2059 
printf "$js_template" "$(base64 -w0 "$out/llhttp_opt.wasm")" > "$out/llhttp_opt.js"

cp lib/llhttp/{constants,utils}.* "$out/"
