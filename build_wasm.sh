#!/bin/bash

set -ex

$WASI_ROOT/bin/clang \
  --sysroot=$WASI_ROOT/share/wasi-sysroot \
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
  ./build/c/*.c \
  ./src/native/*.c \
  -I./build \
  -o ./build/llhttp.wasm
