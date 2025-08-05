export type IntDict = Readonly<Record<string, number>>;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type Simplify<T> = T extends any[] | Date ? T : {
  [K in keyof T]: T[K];
} & {};

export const ERROR = {
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
  CB_PROTOCOL_COMPLETE: 38,
} as const;

export const TYPE = {
  BOTH: 0, // default
  REQUEST: 1,
  RESPONSE: 2,
} as const;

export const FLAGS = {
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
} as const;

export const LENIENT_FLAGS = {
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
} as const;

export const STATUSES = {
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
} as const;

export const FINISH = {
  SAFE: 0,
  SAFE_WITH_CB: 1,
  UNSAFE: 2,
} as const;

export const HEADER_STATE = {
  GENERAL: 0,
  CONNECTION: 1,
  CONTENT_LENGTH: 2,
  TRANSFER_ENCODING: 3,
  UPGRADE: 4,
  CONNECTION_KEEP_ALIVE: 5,
  CONNECTION_CLOSE: 6,
  CONNECTION_UPGRADE: 7,
  TRANSFER_ENCODING_CHUNKED: 8,
} as const;

export const METHODS_HTTP1_HEAD = {
  HEAD: 2,
} as const;

/**
 * HTTP methods as defined by RFC-9110 and other specifications.
 * @see https://httpwg.org/specs/rfc9110.html#method.definitions
 */
export const METHODS_BASIC_HTTP = {
  DELETE: 0,
  GET: 1,
  ...METHODS_HTTP1_HEAD,
  POST: 3,
  PUT: 4,
  CONNECT: 5,
  OPTIONS: 6,
  TRACE: 7,

  /**
   * @see https://www.rfc-editor.org/rfc/rfc5789.html
   */
  PATCH: 28,

  /* RFC-2068, section 19.6.1.2 */
  LINK: 31,
  UNLINK: 32,
} as const;

export const METHODS_WEBDAV = {
  COPY: 8,
  LOCK: 9,
  MKCOL: 10,
  MOVE: 11,
  PROPFIND: 12,
  PROPPATCH: 13,
  SEARCH: 14,
  UNLOCK: 15,
  BIND: 16,
  REBIND: 17,
  UNBIND: 18,
  ACL: 19,
} as const;

export const METHODS_SUBVERSION = {
  REPORT: 20,
  MKACTIVITY: 21,
  CHECKOUT: 22,
  MERGE: 23,
} as const;

export const METHODS_UPNP = {
  'M-SEARCH': 24,
  NOTIFY: 25,
  SUBSCRIBE: 26,
  UNSUBSCRIBE: 27,
} as const;

export const METHODS_CALDAV = {
  MKCALENDAR: 30,
} as const;

export const METHODS_NON_STANDARD = {
  /**
   * Not defined in any RFC but commonly used
   */
  PURGE: 29,

  /* DRAFT https://www.ietf.org/archive/id/draft-ietf-httpbis-safe-method-w-body-02.html */
  QUERY: 46,
} as const;

export const METHODS_ICECAST = {
  SOURCE: 33,
} as const;

export const METHODS_AIRPLAY: Simplify<Pick<typeof METHODS_BASIC_HTTP, "GET" | "POST">> = {
  GET: 1,
  POST: 3,
} as const;

export const METHODS_RAOP = {
  FLUSH: 45,
} as const;

/* RFC-2326 RTSP */
export const METHODS_RTSP = {
  OPTIONS: METHODS_BASIC_HTTP.OPTIONS,
  DESCRIBE: 35,
  ANNOUNCE: 36,
  SETUP: 37,
  PLAY: 38,
  PAUSE: 39,
  TEARDOWN: 40,
  GET_PARAMETER: 41,
  SET_PARAMETER: 42,
  REDIRECT: 43,
  RECORD: 44,

  ...METHODS_AIRPLAY,
  ...METHODS_RAOP,
} as const;

export const METHODS_HTTP1 = {
  ...METHODS_BASIC_HTTP,
  ...METHODS_WEBDAV,
  ...METHODS_SUBVERSION,
  ...METHODS_UPNP,
  ...METHODS_CALDAV,
  ...METHODS_NON_STANDARD,

  // TODO(indutny): should we allow it with HTTP?
  ...METHODS_ICECAST,
} as const;

export const METHODS_HTTP2 = {
  /**
   * RFC-9113, section 11.6
   * @see https://www.rfc-editor.org/rfc/rfc9113.html#preface
   */
  PRI: 34,
} as const;

export const METHODS_HTTP = {
  ...METHODS_HTTP1,
  ...METHODS_HTTP2,
} as const;

export const METHODS = {
  ...METHODS_HTTP1,
  ...METHODS_HTTP2,
  ...METHODS_RTSP,
} as const;

// ALPHA: https://tools.ietf.org/html/rfc5234#appendix-B.1
export const ALPHA = [
  "A", "a", "B", "b", "C", "c", "D", "d",
  "E", "e", "F", "f", "G", "g", "H", "h",
  "I", "i", "J", "j", "K", "k", "L", "l",
  "M", "m", "N", "n", "O", "o", "P", "p",
  "Q", "q", "R", "r", "S", "s", "T", "t",
  "U", "u", "V", "v", "W", "w", "X", "x",
  "Y", "y", "Z", "z",
] as const;

export const NUM_MAP = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
} as const;

export const HEX_MAP = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  A: 0XA, B: 0XB, C: 0XC, D: 0XD, E: 0XE, F: 0XF,
  a: 0xa, b: 0xb, c: 0xc, d: 0xd, e: 0xe, f: 0xf,
} as const;

// DIGIT: https://tools.ietf.org/html/rfc5234#appendix-B.1
export const DIGIT = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
] as const;

export const ALPHANUM = [ ...ALPHA, ...DIGIT ] as const;
export const MARK = [ '-', '_', '.', '!', '~', '*', '\'', '(', ')' ] as const;
export const USERINFO_CHARS = [ ...ALPHANUM, ...MARK, '%', ';', ':', '&', '=', '+', '$', ',' ] as const;

// TODO(indutny): use RFC
export const URL_CHAR = [
  '!', '"', '$', '%', '&', '\'',
  '(', ')', '*', '+', ',', '-', '.', '/',
  ':', ';', '<', '=', '>',
  '@', '[', '\\', ']', '^', '_',
  '`',
  '{', '|', '}', '~',
  ...ALPHANUM
] as const;

export const HEX = [ ...DIGIT, 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F' ] as const;

/* Tokens as defined by rfc 2616. Also lowercases them.
 *        token       = 1*<any CHAR except CTLs or separators>
 *     separators     = "(" | ")" | "<" | ">" | "@"
 *                    | "," | ";" | ":" | "\" | <">
 *                    | "/" | "[" | "]" | "?" | "="
 *                    | "{" | "}" | SP | HT
 */
export const TOKEN = [
  '!', '#', '$', '%', '&', '\'',
  '*', '+', '-', '.',
  '^', '_', '`',
  '|', '~',
  ...ALPHANUM
] as const;

// HTAB: https://tools.ietf.org/html/rfc5234#appendix-B.1
export const HTAB = [ '\t' ] as const;

// SP: https://tools.ietf.org/html/rfc5234#appendix-B.1
export const SP = [ ' ' ] as const;

// VCHAR: https://tools.ietf.org/html/rfc5234#appendix-B.1
const VCHAR = [
  0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30,
  0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38,
  0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40,
  0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50,
  0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
  0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f, 0x60,
  0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
  0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
  0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
  0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e,
] as const;

// OBS_TEXT: https://datatracker.ietf.org/doc/html/rfc9110#name-collected-abnf
// 0x80 - 0xff
const OBS_TEXT = [
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
  0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
  0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f,
  0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf,
  0xb0, 0xb1, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7,
  0xb8, 0xb9, 0xba, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf,
  0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7,
  0xc8, 0xc9, 0xca, 0xcb, 0xcc, 0xcd, 0xce, 0xcf,
  0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7,
  0xd8, 0xd9, 0xda, 0xdb, 0xdc, 0xdd, 0xde, 0xdf,
  0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7,
  0xe8, 0xe9, 0xea, 0xeb, 0xec, 0xed, 0xee, 0xef,
  0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7,
  0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff,
] as const;

export const HTAB_SP_VCHAR_OBS_TEXT = [ ...HTAB, ...SP, ...VCHAR, ...OBS_TEXT ] as const;

export const HEADER_CHARS = HTAB_SP_VCHAR_OBS_TEXT;

// ',' = \x2c
export const CONNECTION_TOKEN_CHARS = [
  ...HTAB, ...SP,
  0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x2b, /* */ 0x2d, 0x2e, 0x2f, 0x30,
  0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38,
  0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40,
  0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50,
  0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
  0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f, 0x60,
  0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
  0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
  0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
  0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e,
  ...OBS_TEXT
] as const;

// QDTEXT: https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.4
export const QDTEXT = [
  ...HTAB, ...SP,
  0x21,
  0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a,
  0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32,
  0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a,
  0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x42,
  0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a,
  0x4b, 0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51, 0x52,
  0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a,
  0x5b,
  0x5d, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64,
  0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c,
  0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74,
  0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c,
  0x7d, 0x7e,
  ...OBS_TEXT
] as const;

export const MAJOR = NUM_MAP;
export const MINOR = MAJOR;

export const SPECIAL_HEADERS = {
  'connection': HEADER_STATE.CONNECTION,
  'content-length': HEADER_STATE.CONTENT_LENGTH,
  'proxy-connection': HEADER_STATE.CONNECTION,
  'transfer-encoding': HEADER_STATE.TRANSFER_ENCODING,
  'upgrade': HEADER_STATE.UPGRADE,
} as const;

export default {
  ERROR,
  TYPE,
  FLAGS,
  LENIENT_FLAGS,
  STATUSES,
  FINISH,
  HEADER_STATE,
  ALPHA,
  NUM_MAP,
  HEX_MAP,
  DIGIT,
  ALPHANUM,
  MARK,
  USERINFO_CHARS,
  URL_CHAR,
  HEX,
  TOKEN,
  HEADER_CHARS,
  CONNECTION_TOKEN_CHARS,
  QDTEXT,
  HTAB_SP_VCHAR_OBS_TEXT,
  MAJOR,
  MINOR,
  SPECIAL_HEADERS,
  METHODS,
  METHODS_HTTP,
  METHODS_HTTP1_HEAD,
  METHODS_HTTP1,
  METHODS_HTTP2,
  METHODS_ICECAST,
  METHODS_RTSP,
}
