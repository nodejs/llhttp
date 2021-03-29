'use strict';

/* global WebAssembly */

const { readFileSync } = require('fs');
const { resolve } = require('path');
const constants = require('../build/wasm/constants.js');
const bin = readFileSync(resolve(__dirname, '../build/wasm/llhttp.wasm'));
const mod = new WebAssembly.Module(bin);

const REQUEST = constants.TYPE.REQUEST;
const RESPONSE = constants.TYPE.RESPONSE;
const kOnMessageBegin = 0;
const kOnHeaders = 1;
const kOnHeadersComplete = 2;
const kOnBody = 3;
const kOnMessageComplete = 4;
const kOnExecute = 5;

const kPtr = Symbol('kPtr');
const kUrl = Symbol('kUrl');
const kStatusMessage = Symbol('kStatusMessage');
const kHeadersFields = Symbol('kHeadersFields');
const kHeadersValues = Symbol('kHeadersValues');
const kBody = Symbol('kBody');
const kReset = Symbol('kReset');
const kCheckErr = Symbol('kCheckErr');

const cstr = (ptr, len) =>
  Buffer.from(inst.exports.memory.buffer, ptr, len).toString();

const wasm_on_message_begin = p => {
  const i = instMap.get(p);
  i[kReset]();
  return i[kOnMessageBegin]();
};

const wasm_on_url = (p, at, length) => {
  instMap.get(p)[kUrl] = cstr(at, length);
  return 0;
};

const wasm_on_status = (p, at, length) => {
  instMap.get(p)[kStatusMessage] = cstr(at, length);
  return 0;
};

const wasm_on_header_field = (p, at, length) => {
  const i= instMap.get(p)
  i[kHeadersFields].push(cstr(at, length));
  return 0;
};

const wasm_on_header_value = (p, at, length) => {
  const i = instMap.get(p);
  i[kHeadersValues].push(cstr(at, length));
  return 0;
};

const wasm_on_headers_complete = p => {
  const i = instMap.get(p);
  const type = inst.exports.llhttp_get_type(p);
  const versionMajor = inst.exports.llhttp_get_http_major(p);
  const versionMinor = inst.exports.llhttp_get_http_minor(p);
  const rawHeaders = [];
  let method;
  let url;
  let statusCode;
  let statusMessage;
  const upgrade = inst.exports.llhttp_get_upgrade(p);
  const shouldKeepAlive = inst.exports.llhttp_should_keep_alive(p);

  for (let c = 0; c < i[kHeadersFields].length; c++) {
    rawHeaders.push(i[kHeadersFields][c], i[kHeadersValues][c])
  }
  i[kOnHeaders](rawHeaders);

  if (type === HTTPParser.REQUEST) {
    method = constants.METHODS[inst.exports.llhttp_get_method(p)];
    url = i[kUrl];
  } else if (type === HTTPParser.RESPONSE) {
    statusCode = inst.exports.llhttp_get_status_code(p);
    statusMessage = i[kStatusMessage];
  }
  return i[kOnHeadersComplete](versionMajor, versionMinor, rawHeaders, method,
url, statusCode, statusMessage, upgrade, shouldKeepAlive);
};

const wasm_on_body = (p, at, length) => {
  const i = instMap.get(p);
  const body = Buffer.from(inst.exports.memory.buffer, at, length);
  return i[kOnBody](body);
};

const wasm_on_message_complete = (p) => {
  return instMap.get(p)[kOnMessageComplete]();
};

const instMap = new Map();

const inst = new WebAssembly.Instance(mod, {
  env: {
    wasm_on_message_begin,
    wasm_on_url,
    wasm_on_status,
    wasm_on_header_field,
    wasm_on_header_value,
    wasm_on_headers_complete,
    wasm_on_body,
    wasm_on_message_complete,
  },
});

inst.exports._initialize(); // wasi reactor

class HTTPParser {
  constructor(type) {
    this[kPtr] = inst.exports.llhttp_alloc(constants.TYPE[type]);
    instMap.set(this[kPtr], this);

    this[kUrl] = '';
    this[kStatusMessage] = null;
    this[kHeadersFields] = [];
    this[kHeadersValues] = [];
    this[kBody] = null;
  }
 
  [kReset]() {
    this[kUrl] = '';
    this[kStatusMessage] = null;
    this[kHeadersFields] = [];
    this[kHeadersValues] = [];
    this[kBody] = null;
  }

  [kOnMessageBegin]() {
    return 0;
  }

  [kOnHeaders](rawHeaders) {}

  [kOnHeadersComplete](versionMajor, versionMinor, rawHeaders, method,
    url, statusCode, statusMessage, upgrade, shouldKeepAlive) {
    return 0;
  }

  [kOnBody](body) {
    this[kBody] = body;
    return 0;
  }

  [kOnMessageComplete]() {
    return 0;
  }

  destroy() {
    instMap.delete(this[kPtr]);
    inst.exports.llhttp_free(this[kPtr]);
  }

  execute(data) {
    // TODO(devsnek): could probably use static alloc and chunk but i'm lazy
    const ptr = inst.exports.malloc(data.byteLength);
    const u8 = new Uint8Array(inst.exports.memory.buffer);
    u8.set(data, ptr);
    const ret = inst.exports.llhttp_execute(this[kPtr], ptr, data.length);
    inst.exports.free(ptr);
    this[kCheckErr](ret);
    return ret;
  }

  [kCheckErr](n) {
    if (n === constants.ERROR.OK) {
      return;
    }
    const ptr = inst.exports.llhttp_get_error_reason(this[kPtr]);
    const u8 = new Uint8Array(inst.exports.memory.buffer);
    const len = u8.indexOf(0, ptr) - ptr;
    throw new Error(cstr(ptr, len));
  }
}

HTTPParser.REQUEST = REQUEST;
HTTPParser.RESPONSE = RESPONSE;
HTTPParser.kOnMessageBegin = kOnMessageBegin;
HTTPParser.kOnHeaders = kOnHeaders;
HTTPParser.kOnHeadersComplete = kOnHeadersComplete;
HTTPParser.kOnBody = kOnBody;
HTTPParser.kOnMessageComplete = kOnMessageComplete;
HTTPParser.kOnExecute = kOnExecute;

{
  const p = new HTTPParser(HTTPParser.REQUEST);

  p.execute(Buffer.from([
    'POST /owo HTTP/1.1',
    'X: Y',
    'Content-Length: 9',
    '',
    'uh, meow?',
    '',
  ].join('\r\n')));

  console.log(p);

  p.destroy();
}

{
  const p = new HTTPParser(HTTPParser.RESPONSE);

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
