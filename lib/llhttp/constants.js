'use strict';

exports.ERROR = {
  INTERNAL: -1,
  INVALID_METHOD: -2,
  INVALID_URL: -3
};

exports.ALPHA = [];

for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
  exports.ALPHA.push(String.fromCharCode(i));
  exports.ALPHA.push(String.fromCharCode(i + 0x20));
}

exports.NUM = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
exports.ALPHANUM = exports.ALPHA.concat(exports.NUM);
exports.MARK = [ '-', '_', '.', '!', '~', '*', '\'', '(', ')' ];
exports.USERINFO_CHARS = exports.ALPHANUM
  .concat(exports.MARK)
  .concat([ '%', ';', ':', '&', '=', '+', '$', ',' ]);

// TODO(indutny): use RFC
exports.STRICT_URL_CHAR = [
  '\x09', '\x0c', '!', '"', '$', '%', '&', '\'',
  '(', ')', '*', '+', ',', '-', '.', '/',
  ':', ';', '<', '=', '>',
  '@', '[', '\\', ']', '^', '_',
  '{', '}', '~'
].concat(exports.ALPHANUM);

exports.URL_CHAR = exports.STRICT_URL_CHAR.concat(
  exports.STRICT_URL_CHAR.map(c => c.charCodeAt(0) | 0x80));

exports.HEX = exports.NUM.concat(
  [ 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F' ]);

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
