'use strict';

/* global WebAssembly */

const fs = require('fs');
const { constants } = require('.');

const bin = fs.readFileSync('./build/llhttp.wasm');
const mod = new WebAssembly.Module(bin);

const cstr = (ptr, len) =>
  Buffer.from(inst.exports.memory.buffer, ptr, len).toString();

const instMap = new Map();

const inst = new WebAssembly.Instance(mod, {
  env: {
    wasm_on_url(p, at, length) {
      instMap.get(p).url = cstr(at, length);
      return 0;
    },
    wasm_on_status(p, at, length) {
      instMap.get(p).status = cstr(at, length);
      return 0;
    },
    wasm_on_header_field(p, at, length) {
      instMap.get(p).headerName = cstr(at, length);
      return 0;
    },
    wasm_on_header_value(p, at, length) {
      const i = instMap.get(p);
      i.headers[i.headerName] = cstr(at, length);
      i.headerName = '';
      return 0;
    },
    wasm_on_body(p, at, length) {
      instMap.get(p).body = Buffer.from(inst.exports.memory.buffer, at, length);
      return 0;
    },
  },
});

inst.exports._initialize(); // wasi reactor

class Parser {
  constructor(type) {
    this.ptr = inst.exports.llhttp_alloc(constants.TYPE[type]);
    instMap.set(this.ptr, this);

    this.url = '';
    this.status = null;
    this.headerName = '';
    this.headers = {};
    this.body = null;
  }

  destroy() {
    instMap.delete(this.ptr);
    inst.exports.llhttp_free(this.ptr);
  }

  execute(data) {
    // could probably use static alloc and chunk but i'm lazy
    const ptr = inst.exports.malloc(data.byteLength);
    const u8 = new Uint8Array(inst.exports.memory.buffer);
    u8.set(data, ptr);
    this.checkErr(inst.exports.llhttp_execute(this.ptr, ptr, data.length));
    inst.exports.free(ptr);
  }

  checkErr(n) {
    if (n === constants.ERROR.OK) {
      return;
    }
    const ptr = inst.exports.llhttp_get_error_reason(this.ptr);
    const u8 = new Uint8Array(inst.exports.memory.buffer);
    const len = u8.indexOf(0, ptr) - ptr;
    throw new Error(cstr(ptr, len));
  }
}

{
  const p = new Parser('REQUEST');

  p.execute(Buffer.from(`\
POST /owo HTTP/1.1\r
X: Y\r
Content-Length: 9\r
\r
uh, meow?\r
`));

  console.log(p);

  p.destroy();
}

{
  const p = new Parser('RESPONSE');

  p.execute(Buffer.from(`\
HTTP/1.1 200 OK\r
X: Y\r
Content-Length: 9\r
\r
uh, meow?\r
`));

  console.log(p);

  p.destroy();
}
