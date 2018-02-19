'use strict';

exports.ERROR = {
  INTERNAL: -1,
  INVALID_METHOD: -2,
  INVALID_URL: -3
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
