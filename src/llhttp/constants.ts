import { enumToMap } from './utils';

export type Enum = Record<string, number>;

// Emums

export const ERROR: Enum = {
  OK: 0,
  INTERNAL: 1,
  STRICT: 2,
  CR_EXPECTED: 25,
  LF_EXPECTED: 3,
  UNEXPECTED_CONTENT_LENGTH: 4,
  UNEXPECTED_SPACE: 30,
  CLOSED_CONNECTION: 5,
  INVALID_METHOD: 6,
  INVALID_URL: 7,
  INVALID_CONSTANT: 8,
  INVALID_VERSION: 9,
  INVALID_HEADER_TOKEN: 10,
  INVALID_CONTENT_LENGTH: 11,
  INVALID_CHUNK_SIZE: 12,
  INVALID_STATUS: 13,
  INVALID_EOF_STATE: 14,
  INVALID_TRANSFER_ENCODING: 15,

  CB_MESSAGE_BEGIN: 16,
  CB_HEADERS_COMPLETE: 17,
  CB_MESSAGE_COMPLETE: 18,
  CB_CHUNK_HEADER: 19,
  CB_CHUNK_COMPLETE: 20,

  PAUSED: 21,
  PAUSED_UPGRADE: 22,
  PAUSED_H2_UPGRADE: 23,

  USER: 24,

  CB_URL_COMPLETE: 26,
  CB_STATUS_COMPLETE: 27,
  CB_METHOD_COMPLETE: 32,
  CB_VERSION_COMPLETE: 33,
  CB_HEADER_FIELD_COMPLETE: 28,
  CB_HEADER_VALUE_COMPLETE: 29,
  CB_CHUNK_EXTENSION_NAME_COMPLETE: 34,
  CB_CHUNK_EXTENSION_VALUE_COMPLETE: 35,
  CB_RESET: 31,
};

export const TYPE: Enum = {
  BOTH: 0, // default
  REQUEST: 1,
  RESPONSE: 2,
};

export const FLAGS: Enum = {
  CONNECTION_KEEP_ALIVE: 1 << 0,
  CONNECTION_CLOSE: 1 << 1,
  CONNECTION_UPGRADE: 1 << 2,
  CHUNKED: 1 << 3,
  UPGRADE: 1 << 4,
  CONTENT_LENGTH: 1 << 5,
  SKIPBODY: 1 << 6,
  TRAILING: 1 << 7,
  // 1 << 8 is unused
  TRANSFER_ENCODING: 1 << 9,
};

export const LENIENT_FLAGS: Enum = {
  HEADERS: 1 << 0,
  CHUNKED_LENGTH: 1 << 1,
  KEEP_ALIVE: 1 << 2,
  TRANSFER_ENCODING: 1 << 3,
  VERSION: 1 << 4,
  DATA_AFTER_CLOSE: 1 << 5,
  OPTIONAL_LF_AFTER_CR: 1 << 6,
  OPTIONAL_CRLF_AFTER_CHUNK: 1 << 7,
  OPTIONAL_CR_BEFORE_LF: 1 << 8,
  SPACES_AFTER_CHUNK_SIZE: 1 << 9,
};

export const METHODS: Enum = {
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
  'M-SEARCH': 24,
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
  'SOURCE': 33,
  /* RFC-7540, section 11.6 */
  'PRI': 34,
  /* RFC-2326 RTSP */
  'DESCRIBE': 35,
  'ANNOUNCE': 36,
  'SETUP': 37,
  'PLAY': 38,
  'PAUSE': 39,
  'TEARDOWN': 40,
  'GET_PARAMETER': 41,
  'SET_PARAMETER': 42,
  'REDIRECT': 43,
  'RECORD': 44,
  /* RAOP */
  'FLUSH': 45,
  /* DRAFT https://www.ietf.org/archive/id/draft-ietf-httpbis-safe-method-w-body-02.html */
  'QUERY': 46,
};

export const STATUSES: Enum = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,
  RESPONSE_IS_STALE: 110, // Unofficial
  REVALIDATION_FAILED: 111, // Unofficial
  DISCONNECTED_OPERATION: 112, // Unofficial
  HEURISTIC_EXPIRATION: 113, // Unofficial
  MISCELLANEOUS_WARNING: 199, // Unofficial
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  TRANSFORMATION_APPLIED: 214, // Unofficial
  IM_USED: 226,
  MISCELLANEOUS_PERSISTENT_WARNING: 299, // Unofficial
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  SWITCH_PROXY: 306, // No longer used
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  PAGE_EXPIRED: 419, // Unofficial
  ENHANCE_YOUR_CALM: 420, // Unofficial
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE_UNOFFICIAL: 430, // Unofficial
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  LOGIN_TIMEOUT: 440, // Unofficial
  NO_RESPONSE: 444, // Unofficial
  RETRY_WITH: 449, // Unofficial
  BLOCKED_BY_PARENTAL_CONTROL: 450, // Unofficial
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  CLIENT_CLOSED_LOAD_BALANCED_REQUEST: 460, // Unofficial
  INVALID_X_FORWARDED_FOR: 463, // Unofficial
  REQUEST_HEADER_TOO_LARGE: 494, // Unofficial
  SSL_CERTIFICATE_ERROR: 495, // Unofficial
  SSL_CERTIFICATE_REQUIRED: 496, // Unofficial
  HTTP_REQUEST_SENT_TO_HTTPS_PORT: 497, // Unofficial
  INVALID_TOKEN: 498, // Unofficial
  CLIENT_CLOSED_REQUEST: 499, // Unofficial
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  BANDWIDTH_LIMIT_EXCEEDED: 509,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
  WEB_SERVER_UNKNOWN_ERROR: 520, // Unofficial
  WEB_SERVER_IS_DOWN: 521, // Unofficial
  CONNECTION_TIMEOUT: 522, // Unofficial
  ORIGIN_IS_UNREACHABLE: 523, // Unofficial
  TIMEOUT_OCCURED: 524, // Unofficial
  SSL_HANDSHAKE_FAILED: 525, // Unofficial
  INVALID_SSL_CERTIFICATE: 526, // Unofficial
  RAILGUN_ERROR: 527, // Unofficial
  SITE_IS_OVERLOADED: 529, // Unofficial
  SITE_IS_FROZEN: 530, // Unofficial
  IDENTITY_PROVIDER_AUTHENTICATION_ERROR: 561, // Unofficial
  NETWORK_READ_TIMEOUT: 598, // Unofficial
  NETWORK_CONNECT_TIMEOUT: 599, // Unofficial
};

export const FINISH: Enum = {
  SAFE: 0,
  SAFE_WITH_CB: 1,
  UNSAFE: 2,
};

export const HEADER_STATE: Enum = {
  GENERAL: 0,
  CONNECTION: 1,
  CONTENT_LENGTH: 2,
  TRANSFER_ENCODING: 3,
  UPGRADE: 4,
  CONNECTION_KEEP_ALIVE: 5,
  CONNECTION_CLOSE: 6,
  CONNECTION_UPGRADE: 7,
  TRANSFER_ENCODING_CHUNKED: 8,
};

// C headers
export const METHODS_HTTP = [
  METHODS.DELETE,
  METHODS.GET,
  METHODS.HEAD,
  METHODS.POST,
  METHODS.PUT,
  METHODS.CONNECT,
  METHODS.OPTIONS,
  METHODS.TRACE,
  METHODS.COPY,
  METHODS.LOCK,
  METHODS.MKCOL,
  METHODS.MOVE,
  METHODS.PROPFIND,
  METHODS.PROPPATCH,
  METHODS.SEARCH,
  METHODS.UNLOCK,
  METHODS.BIND,
  METHODS.REBIND,
  METHODS.UNBIND,
  METHODS.ACL,
  METHODS.REPORT,
  METHODS.MKACTIVITY,
  METHODS.CHECKOUT,
  METHODS.MERGE,
  METHODS['M-SEARCH'],
  METHODS.NOTIFY,
  METHODS.SUBSCRIBE,
  METHODS.UNSUBSCRIBE,
  METHODS.PATCH,
  METHODS.PURGE,
  METHODS.MKCALENDAR,
  METHODS.LINK,
  METHODS.UNLINK,
  METHODS.PRI,

  // TODO(indutny): should we allow it with HTTP?
  METHODS.SOURCE,
  METHODS.QUERY,
];

export const METHODS_ICE = [
  METHODS.SOURCE,
];

export const METHODS_RTSP = [
  METHODS.OPTIONS,
  METHODS.DESCRIBE,
  METHODS.ANNOUNCE,
  METHODS.SETUP,
  METHODS.PLAY,
  METHODS.PAUSE,
  METHODS.TEARDOWN,
  METHODS.GET_PARAMETER,
  METHODS.SET_PARAMETER,
  METHODS.REDIRECT,
  METHODS.RECORD,
  METHODS.FLUSH,

  // For AirPlay
  METHODS.GET,
  METHODS.POST,
];

export const METHOD_MAP = enumToMap(METHODS);

export const H_METHOD_MAP = Object.fromEntries(
  Object.entries(METHODS).filter(([ k ]) => k.startsWith('H'))
);

export const STATUSES_HTTP = [
  STATUSES.CONTINUE,
  STATUSES.SWITCHING_PROTOCOLS,
  STATUSES.PROCESSING,
  STATUSES.EARLY_HINTS,
  STATUSES.RESPONSE_IS_STALE,
  STATUSES.REVALIDATION_FAILED,
  STATUSES.DISCONNECTED_OPERATION,
  STATUSES.HEURISTIC_EXPIRATION,
  STATUSES.MISCELLANEOUS_WARNING,
  STATUSES.OK,
  STATUSES.CREATED,
  STATUSES.ACCEPTED,
  STATUSES.NON_AUTHORITATIVE_INFORMATION,
  STATUSES.NO_CONTENT,
  STATUSES.RESET_CONTENT,
  STATUSES.PARTIAL_CONTENT,
  STATUSES.MULTI_STATUS,
  STATUSES.ALREADY_REPORTED,
  STATUSES.TRANSFORMATION_APPLIED,
  STATUSES.IM_USED,
  STATUSES.MISCELLANEOUS_PERSISTENT_WARNING,
  STATUSES.MULTIPLE_CHOICES,
  STATUSES.MOVED_PERMANENTLY,
  STATUSES.FOUND,
  STATUSES.SEE_OTHER,
  STATUSES.NOT_MODIFIED,
  STATUSES.USE_PROXY,
  STATUSES.SWITCH_PROXY,
  STATUSES.TEMPORARY_REDIRECT,
  STATUSES.PERMANENT_REDIRECT,
  STATUSES.BAD_REQUEST,
  STATUSES.UNAUTHORIZED,
  STATUSES.PAYMENT_REQUIRED,
  STATUSES.FORBIDDEN,
  STATUSES.NOT_FOUND,
  STATUSES.METHOD_NOT_ALLOWED,
  STATUSES.NOT_ACCEPTABLE,
  STATUSES.PROXY_AUTHENTICATION_REQUIRED,
  STATUSES.REQUEST_TIMEOUT,
  STATUSES.CONFLICT,
  STATUSES.GONE,
  STATUSES.LENGTH_REQUIRED,
  STATUSES.PRECONDITION_FAILED,
  STATUSES.PAYLOAD_TOO_LARGE,
  STATUSES.URI_TOO_LONG,
  STATUSES.UNSUPPORTED_MEDIA_TYPE,
  STATUSES.RANGE_NOT_SATISFIABLE,
  STATUSES.EXPECTATION_FAILED,
  STATUSES.IM_A_TEAPOT,
  STATUSES.PAGE_EXPIRED,
  STATUSES.ENHANCE_YOUR_CALM,
  STATUSES.MISDIRECTED_REQUEST,
  STATUSES.UNPROCESSABLE_ENTITY,
  STATUSES.LOCKED,
  STATUSES.FAILED_DEPENDENCY,
  STATUSES.TOO_EARLY,
  STATUSES.UPGRADE_REQUIRED,
  STATUSES.PRECONDITION_REQUIRED,
  STATUSES.TOO_MANY_REQUESTS,
  STATUSES.REQUEST_HEADER_FIELDS_TOO_LARGE_UNOFFICIAL,
  STATUSES.REQUEST_HEADER_FIELDS_TOO_LARGE,
  STATUSES.LOGIN_TIMEOUT,
  STATUSES.NO_RESPONSE,
  STATUSES.RETRY_WITH,
  STATUSES.BLOCKED_BY_PARENTAL_CONTROL,
  STATUSES.UNAVAILABLE_FOR_LEGAL_REASONS,
  STATUSES.CLIENT_CLOSED_LOAD_BALANCED_REQUEST,
  STATUSES.INVALID_X_FORWARDED_FOR,
  STATUSES.REQUEST_HEADER_TOO_LARGE,
  STATUSES.SSL_CERTIFICATE_ERROR,
  STATUSES.SSL_CERTIFICATE_REQUIRED,
  STATUSES.HTTP_REQUEST_SENT_TO_HTTPS_PORT,
  STATUSES.INVALID_TOKEN,
  STATUSES.CLIENT_CLOSED_REQUEST,
  STATUSES.INTERNAL_SERVER_ERROR,
  STATUSES.NOT_IMPLEMENTED,
  STATUSES.BAD_GATEWAY,
  STATUSES.SERVICE_UNAVAILABLE,
  STATUSES.GATEWAY_TIMEOUT,
  STATUSES.HTTP_VERSION_NOT_SUPPORTED,
  STATUSES.VARIANT_ALSO_NEGOTIATES,
  STATUSES.INSUFFICIENT_STORAGE,
  STATUSES.LOOP_DETECTED,
  STATUSES.BANDWIDTH_LIMIT_EXCEEDED,
  STATUSES.NOT_EXTENDED,
  STATUSES.NETWORK_AUTHENTICATION_REQUIRED,
  STATUSES.WEB_SERVER_UNKNOWN_ERROR,
  STATUSES.WEB_SERVER_IS_DOWN,
  STATUSES.CONNECTION_TIMEOUT,
  STATUSES.ORIGIN_IS_UNREACHABLE,
  STATUSES.TIMEOUT_OCCURED,
  STATUSES.SSL_HANDSHAKE_FAILED,
  STATUSES.INVALID_SSL_CERTIFICATE,
  STATUSES.RAILGUN_ERROR,
  STATUSES.SITE_IS_OVERLOADED,
  STATUSES.SITE_IS_FROZEN,
  STATUSES.IDENTITY_PROVIDER_AUTHENTICATION_ERROR,
  STATUSES.NETWORK_READ_TIMEOUT,
  STATUSES.NETWORK_CONNECT_TIMEOUT,
];

// Internal

export type CharList = Array<string | number>;

export const ALPHA: CharList = [];

for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
  // Upper case
  ALPHA.push(String.fromCharCode(i));

  // Lower case
  ALPHA.push(String.fromCharCode(i + 0x20));
}

export const NUM_MAP = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
};

export const HEX_MAP = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  A: 0XA, B: 0XB, C: 0XC, D: 0XD, E: 0XE, F: 0XF,
  a: 0xa, b: 0xb, c: 0xc, d: 0xd, e: 0xe, f: 0xf,
};

export const NUM: CharList = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

export const ALPHANUM: CharList = ALPHA.concat(NUM);
export const MARK: CharList = [ '-', '_', '.', '!', '~', '*', '\'', '(', ')' ];
export const USERINFO_CHARS: CharList = ALPHANUM
  .concat(MARK)
  .concat([ '%', ';', ':', '&', '=', '+', '$', ',' ]);

// TODO(indutny): use RFC
export const URL_CHAR: CharList = ([
  '!', '"', '$', '%', '&', '\'',
  '(', ')', '*', '+', ',', '-', '.', '/',
  ':', ';', '<', '=', '>',
  '@', '[', '\\', ']', '^', '_',
  '`',
  '{', '|', '}', '~',
] as CharList).concat(ALPHANUM);

export const HEX: CharList = NUM.concat(
  [ 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F' ]);

/* Tokens as defined by rfc 2616. Also lowercases them.
 *        token       = 1*<any CHAR except CTLs or separators>
 *     separators     = "(" | ")" | "<" | ">" | "@"
 *                    | "," | ";" | ":" | "\" | <">
 *                    | "/" | "[" | "]" | "?" | "="
 *                    | "{" | "}" | SP | HT
 */
export const TOKEN: CharList = ([
  '!', '#', '$', '%', '&', '\'',
  '*', '+', '-', '.',
  '^', '_', '`',
  '|', '~',
] as CharList).concat(ALPHANUM);

/*
 * Verify that a char is a valid visible (printable) US-ASCII
 * character or %x80-FF
 */
export const HEADER_CHARS: CharList = [ '\t' ];
for (let i = 32; i <= 255; i++) {
  if (i !== 127) {
    HEADER_CHARS.push(i);
  }
}

// ',' = \x44
export const CONNECTION_TOKEN_CHARS: CharList =
  HEADER_CHARS.filter((c: string | number) => c !== 44);

export const QUOTED_STRING: CharList = [ '\t', ' ' ];
for (let i = 0x21; i <= 0xff; i++) {
  if (i !== 0x22 && i !== 0x5c) { // All characters in ASCII except \ and "
    QUOTED_STRING.push(i);
  }
}

export const HTAB_SP_VCHAR_OBS_TEXT: CharList = [ '\t', ' ' ];

// VCHAR: https://tools.ietf.org/html/rfc5234#appendix-B.1
for (let i = 0x21; i <= 0x7E; i++) {
  HTAB_SP_VCHAR_OBS_TEXT.push(i);
}
// OBS_TEXT: https://datatracker.ietf.org/doc/html/rfc9110#name-collected-abnf
for (let i = 0x80; i <= 0xff; i++) {
  HTAB_SP_VCHAR_OBS_TEXT.push(i);
}

export const MAJOR = NUM_MAP;
export const MINOR = MAJOR;

export const SPECIAL_HEADERS = {
  'connection': HEADER_STATE.CONNECTION,
  'content-length': HEADER_STATE.CONTENT_LENGTH,
  'proxy-connection': HEADER_STATE.CONNECTION,
  'transfer-encoding': HEADER_STATE.TRANSFER_ENCODING,
  'upgrade': HEADER_STATE.UPGRADE,
};
