'use strict';

// C headers

exports.ERROR = {
  OK: 0,
  INTERNAL: 1,
  STRICT: 2,
  LF_EXPECTED: 3,
  UNEXPECTED_CONTENT_LENGTH: 4,
  CLOSED_CONNECTION: 5,
  INVALID_METHOD: 6,
  INVALID_URL: 7,
  INVALID_CONSTANT: 8,
  INVALID_VERSION: 9,
  INVALID_HEADER_TOKEN: 10,
  INVALID_CONTENT_LENGTH: 11,
  INVALID_CHUNK_SIZE: 12,
  INVALID_STATUS: 13,

  CB_HEADERS_COMPLETE: 14,
  CB_MESSAGE_COMPLETE: 15,
  CB_CHUNK_HEADER: 16,
  CB_CHUNK_COMPLETE: 17,

  PAUSED: 18
};

exports.TYPE = {
  BOTH: 0,  // default
  REQUEST: 1,
  RESPONSE: 2
};

exports.FLAGS = {
  CONNECTION_KEEP_ALIVE: 0x1,
  CONNECTION_CLOSE: 0x2,
  CONNECTION_UPGRADE: 0x4,
  CHUNKED: 0x8,
  UPGRADE: 0x10,
  CONTENT_LENGTH: 0x20,
  SKIPBODY: 0x40,
  TRAILING: 0x80
};

exports.METHODS = {
  'DELETE': 0,
  'GET': 1,
  'HEAD': 2,
  'POST': 3,
  'PUT': 4,
  /* pathological */
  'CONNECT': 5,
  'OPTIONS': 6,
  'TRACE': 7,
  /* WebDAV */
  'COPY': 8,
  'LOCK': 9,
  'MKCOL': 10,
  'MOVE': 11,
  'PROPFIND': 12,
  'PROPPATCH': 13,
  'SEARCH': 14,
  'UNLOCK': 15,
  'BIND': 16,
  'REBIND': 17,
  'UNBIND': 18,
  'ACL': 19,
  /* subversion */
  'REPORT': 20,
  'MKACTIVITY': 21,
  'CHECKOUT': 22,
  'MERGE': 23,
  /* upnp */
  'MSEARCH': 24,
  'NOTIFY': 25,
  'SUBSCRIBE': 26,
  'UNSUBSCRIBE': 27,
  /* RFC-5789 */
  'PATCH': 28,
  'PURGE': 29,
  /* CalDAV */
  'MKCALENDAR': 30,
  /* RFC-2068, section 19.6.1.2 */
  'LINK': 31,
  'UNLINK': 32,
  /* icecast */
  'SOURCE': 33
};


// Internal

exports.ALPHA = [];

for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
  exports.ALPHA.push(String.fromCharCode(i));
  exports.ALPHA.push(String.fromCharCode(i + 0x20));
}

exports.NUM_MAP = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

exports.HEX_MAP = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'a': 0xa, 'b': 0xb, 'c': 0xc, 'd': 0xd, 'e': 0xe, 'f': 0xf
};

exports.NUM = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
exports.ALPHANUM = exports.ALPHA.concat(exports.NUM);
exports.MARK = [ '-', '_', '.', '!', '~', '*', '\'', '(', ')' ];
exports.USERINFO_CHARS = exports.ALPHANUM
  .concat(exports.MARK)
  .concat([ '%', ';', ':', '&', '=', '+', '$', ',' ]);

// TODO(indutny): use RFC
exports.STRICT_URL_CHAR = [
  '!', '"', '$', '%', '&', '\'',
  '(', ')', '*', '+', ',', '-', '.', '/',
  ':', ';', '<', '=', '>',
  '@', '[', '\\', ']', '^', '_',
  '`',
  '{', '}', '~'
].concat(exports.ALPHANUM);

exports.URL_CHAR = exports.STRICT_URL_CHAR.concat(
  [ '\t', '\f' ].concat(exports.STRICT_URL_CHAR)
    .map(c => c.charCodeAt(0) | 0x80));

exports.HEX = exports.NUM.concat(
  [ 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F' ]);

/* Tokens as defined by rfc 2616. Also lowercases them.
 *        token       = 1*<any CHAR except CTLs or separators>
 *     separators     = "(" | ")" | "<" | ">" | "@"
 *                    | "," | ";" | ":" | "\" | <">
 *                    | "/" | "[" | "]" | "?" | "="
 *                    | "{" | "}" | SP | HT
 */
exports.STRICT_TOKEN = [
  '!', '#', '$', '%', '&', '\'',
  '*', '+', '-', '.',
  '^', '_', '`',
  '|', '~'
].concat(exports.ALPHANUM);

exports.TOKEN = exports.STRICT_TOKEN.concat([ ' ' ]);

/**
 * Verify that a char is a valid visible (printable) US-ASCII
 * character or %x80-FF
 **/
exports.HEADER_CHARS = [ '\t' ];
for (let i = 32; i < 255; i++)
  if (i !== 127)
    exports.HEADER_CHARS.push(i);

// ',' = \x44
exports.CONNECTION_TOKEN_CHARS = exports.HEADER_CHARS.filter(c => c != 44);

exports.MAJOR = exports.NUM_MAP;
exports.MINOR = exports.MAJOR;

const HEADER_STATE = exports.HEADER_STATE = {
  GENERAL: 0,
  PROXY_CONNECTION: 1,
  CONNECTION: 2,
  CONTENT_LENGTH: 3,
  TRANSFER_ENCODING: 4,
  UPGRADE: 5,

  CONNECTION_KEEP_ALIVE: 6,
  CONNECTION_CLOSE: 7,
  CONNECTION_UPGRADE: 8,
  TRANSFER_ENCODING_CHUNKED: 9
};

exports.SPECIAL_HEADERS = {
  'proxy-connection': HEADER_STATE.PROXY_CONNECTION,
  'connection': HEADER_STATE.CONNECTION,
  'content-length': HEADER_STATE.CONTENT_LENGTH,
  'transfer-encoding': HEADER_STATE.TRANSFER_ENCODING,
  'upgrade': HEADER_STATE.UPGRADE
};
