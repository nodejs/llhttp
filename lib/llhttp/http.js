'use strict';

const assert = require('assert');

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;
const SPECIAL_HEADERS = constants.SPECIAL_HEADERS;
const HEADER_STATE = constants.HEADER_STATE;
const FLAGS = constants.FLAGS;
const TYPE = constants.TYPE;

const NODES = [
  'start',
  'start_req',
  'start_res',
  'start_req_or_res',

  'res_http_major',
  'res_http_dot',
  'res_http_minor',
  'res_http_end',
  'res_status_code',
  'res_status_code_otherwise',
  'res_status_start',
  'res_status',
  'res_line_almost_done',

  'req_spaces_before_url',
  'req_http_start',
  'req_http_major',
  'req_http_dot',
  'req_http_minor',
  'req_http_end',

  'header_field_start',
  'header_field',
  'header_field_colon',
  'header_field_general',
  'header_field_general_otherwise',
  'header_value_discard_ws',
  'header_value_discard_ws_almost_done',
  'header_value_discard_lws',
  'header_value_discard_rws',
  'header_value_start',
  'header_value',
  'header_value_otherwise',
  'header_value_lws',
  'header_value_te_chunked',
  'header_value_content_length_once',
  'header_value_content_length',
  'header_value_connection',
  'header_value_connection_ws',
  'header_value_connection_token',
  'header_value_almost_done',

  'headers_almost_done',
  'headers_done',

  'chunk_size_start',
  'chunk_size',
  'chunk_size_otherwise',
  'chunk_size_almost_done',
  'chunk_size_almost_done_lf',
  'chunk_parameters',
  'chunk_data',
  'chunk_data_almost_done',
  'chunk_data_almost_done_skip',
  'chunk_complete',
  'body_identity',
  'body_identity_eof',

  'message_done',

  'eof',
  'cleanup',
  'closed',
  'restart'
];

class HTTP {
  constructor(p, isStrict = false) {
    this.p = p;
    this.isStrict = isStrict;

    this.url = new llhttp.URL(p, isStrict);
    this.TOKEN = this.isStrict ? constants.STRICT_TOKEN : constants.TOKEN;

    this.span = {
      status: p.span(p.code.span('http_parser__on_status')),
      headerField: p.span(p.code.span('http_parser__on_header_field')),
      headerValue: p.span(p.code.span('http_parser__on_header_value')),
      body: p.span(p.code.span('http_parser__on_body'))
    };

    this.callback = {
      beforeHeadersComplete:
        p.code.match('http_parser__before_headers_complete'),
      onHeadersComplete: p.code.match('http_parser__on_headers_complete'),
      afterHeadersComplete:
        p.code.match('http_parser__after_headers_complete'),

      onMessageComplete: p.code.match('http_parser__on_message_complete'),
      afterMessageComplete: p.code.match('http_parser__after_message_complete'),

      onChunkHeader: p.code.match('http_parser__on_chunk_header'),
      onChunkComplete: p.code.match('http_parser__on_chunk_complete')
    };

    this.nodes = new Map();
    NODES.forEach(name => this.nodes.set(name, p.node(name)));
  }

  node(name) {
    if (typeof name === 'object')
      return name;

    assert(this.nodes.has(name), 'Unknown node: ' + name);
    return this.nodes.get(name);
  }

  load(name, map, next) {
    const res = this.p.invoke(this.p.code.load(name), map);
    if (next)
      res.otherwise(this.node(next));
    return res;
  }

  store(name, next) {
    const res = this.p.invoke(this.p.code.store(name));
    if (next)
      res.otherwise(this.node(next));
    return res;
  }

  update(name, value, next) {
    const res = this.p.invoke(this.p.code.update(name, value));
    if (next)
      res.otherwise(this.node(next));
    return res;
  }

  resetHeaderState(next) {
    return this.update('header_state', HEADER_STATE.GENERAL, next);
  }

  emptySpan(span, next) {
    return span.start(span.end(this.node(next)));
  }

  setFlag(flag, next) {
    return this.p.invoke(this.p.code.or('flags', flag), this.node(next));
  }

  testFlags(flag, map, next) {
    const res = this.p.invoke(this.p.code.test('flags', flag), map);
    if (next)
      res.otherwise(this.node(next));
    return res;
  }

  setHeaderFlags(next) {
    const HS = HEADER_STATE;
    const F = FLAGS;

    return this.load('header_state', {
      [HS.CONNECTION_KEEP_ALIVE]: this.setFlag(F.CONNECTION_KEEP_ALIVE, next),
      [HS.CONNECTION_CLOSE]: this.setFlag(F.CONNECTION_CLOSE, next),
      [HS.CONNECTION_UPGRADE]: this.setFlag(F.CONNECTION_UPGRADE, next),
      [HS.TRANSFER_ENCODING_CHUNKED]: this.setFlag(F.CHUNKED, next)
    }, this.node(next));
  }

  mulAdd(field, targets, options = {}) {
    const p = this.p;
    options = Object.assign({ base: 10, signed: false }, options);

    return p.invoke(p.code.mulAdd(field, options), {
      1: this.node(targets.overflow)
    }, this.node(targets.success));
  }

  isEqual(field, value, map) {
    const p = this.p;
    return p.invoke(p.code.isEqual(field, value), {
      0: this.node(map.notEqual)
    }, this.node(map.equal));
  }

  build() {
    const p = this.p;

    p.property('i8', 'type');
    p.property('i8', 'method');
    p.property('i8', 'http_major');
    p.property('i8', 'http_minor');
    p.property('i8', 'header_state');
    p.property('i8', 'flags');
    p.property('i8', 'upgrade');
    p.property('i16', 'status_code');
    p.property('i64', 'content_length');

    this.buildLine();
    this.buildHeaders();

    return {
      entry: this.node('start')
    };
  }

  buildLine() {
    const p = this.p;
    const span = this.span;
    const n = name => this.node(name);

    const url = this.url.build();

    n('start')
      .otherwise(this.load('type', {
        [TYPE.REQUEST]: n('start_req'),
        [TYPE.RESPONSE]: n('start_res')
      }, n('start_req_or_res')));

    n('start_req_or_res')
      .match([ '\r', '\n' ], n('start_req_or_res'))
      .select(constants.METHODS, this.store('method',
        this.update('type', TYPE.REQUEST, 'req_spaces_before_url')))
      .match('HTTP/', this.update('type', TYPE.RESPONSE, 'res_http_major'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Invalid word encountered'));

    // Response

    n('start_res')
      .match([ '\r', '\n' ], n('start_res'))
      .match('HTTP/', n('res_http_major'))
      .skipTo(n('start_res'));

    n('res_http_major')
      .select(constants.MAJOR, this.store('http_major', 'res_http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('res_http_dot')
      .match('.', n('res_http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('res_http_minor')
      .select(constants.MINOR, this.store('http_minor', 'res_http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('res_http_end')
      .match(' ', this.update('status_code', 0, 'res_status_code'))
      .otherwise(p.error(ERROR.INVALID_STATUS, 'Invalid response status'));

    n('res_status_code')
      .select(constants.NUM_MAP, this.mulAdd('status_code', {
        success: 'res_status_code',
        overflow: p.error(ERROR.INVALID_STATUS, 'Response overflow')
      }, { max: 999 }))
      .otherwise(n('res_status_code_otherwise'));

    n('res_status_code_otherwise')
      .match(' ', n('res_status_start'))
      .peek([ '\r', '\n' ], n('res_status_start'))
      .otherwise(p.error(ERROR.INVALID_STATUS, 'Invalid response status'));

    n('res_status_start')
      .match('\r', n('res_line_almost_done'))
      .match('\n', n('header_field_start'))
      .otherwise(span.status.start(n('res_status')));

    n('res_status')
      .peek('\r', span.status.end().skipTo(n('res_line_almost_done')))
      .peek('\n', span.status.end().skipTo(n('header_field_start')))
      .skipTo(n('res_status'));

    if (this.isStrict) {
      n('res_line_almost_done')
        .match('\n', n('header_field_start'))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after CR'));
    } else {
      n('res_line_almost_done')
        .skipTo(n('header_field_start'));
    }

    // Request

    n('start_req')
      .match([ '\r', '\n' ], n('start_req'))
      .select(constants.METHODS, this.store('method', 'req_spaces_before_url'))
      .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

    n('req_spaces_before_url')
      .match(' ', n('req_spaces_before_url'))
      .otherwise(this.isEqual('method', constants.METHODS.CONNECT, {
        equal: url.entry.connect,
        notEqual: url.entry.normal
      }));

    url.exit.toHTTP
      .otherwise(n('req_http_start'));

    url.exit.toHTTP09
      .otherwise(
        this.update('http_major', 0,
          this.update('http_minor', 9, 'header_field_start'))
      );

    n('req_http_start')
      .match('HTTP/', n('req_http_major'))
      .match(' ', n('req_http_start'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

    n('req_http_major')
      .select(constants.MAJOR, this.store('http_major', 'req_http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('req_http_dot')
      .match('.', n('req_http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('req_http_minor')
      .select(constants.MINOR, this.store('http_minor', 'req_http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('req_http_end')
      .match([ '\r\n', '\n' ], n('header_field_start'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected CRLF after version'));
  }

  buildHeaders() {
    this.buildHeaderField();
    this.buildHeaderValue();
  }

  buildHeaderField() {
    const p = this.p;
    const span = this.span;
    const n = name => this.node(name);

    n('header_field_start')
      .match('\r', n('headers_almost_done'))
      /* they might be just sending \n instead of \r\n so this would be
       * the second \n to denote the end of headers*/
      .peek('\n', n('headers_almost_done'))
      .otherwise(span.headerField.start(n('header_field')));

    n('header_field')
      .transform(p.transform.toLowerUnsafe())
      // Match headers that need special treatment
      .select(SPECIAL_HEADERS, this.store('header_state', 'header_field_colon'))
      .otherwise(n('header_field_general'));

    n('header_field_colon')
      .match(' ', n('header_field_colon'))
      .peek(':', span.headerField.end().skipTo(n('header_value_discard_ws')))
      // Fallback to general header, there're additional characters:
      // `Connection-Duration` instead of `Connection` and so on.
      .otherwise(this.resetHeaderState('header_field_general'));

    n('header_field_general')
      .match(this.TOKEN, n('header_field_general'))
      .otherwise(n('header_field_general_otherwise'));

    // Just a performance optimization, split the node so that the fast case
    // remains in `header_field_general`
    n('header_field_general_otherwise')
      .peek(':', span.headerField.end().skipTo(n('header_value_discard_ws')))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));
  }

  pause(msg, next) {
    const res = this.p.pause(ERROR.PAUSED, msg);
    if (next)
      res.otherwise(this.node(next));
    return res;
  }

  invokePausable(name, next) {
    let cb;
    if (name === 'on_message_complete')
      cb = this.callback.onMessageComplete;
    else if (name === 'on_chunk_header')
      cb = this.callback.onChunkHeader;
    else if (name === 'on_chunk_complete')
      cb = this.callback.onChunkComplete;
    else
      throw new Error('Unknown callback: ' + name);

    return this.p.invoke(cb, {
      [ERROR.PAUSED]: this.pause(`${name} pause`, next)
    }, this.node(next));
  }

  buildHeaderValue() {
    const p = this.p;
    const span = this.span;
    const callback = this.callback;
    const n = name => this.node(name);

    const fallback = this.resetHeaderState('header_value');

    n('header_value_discard_ws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      .match('\r', n('header_value_discard_ws_almost_done'))
      .match('\n', n('header_value_discard_lws'))
      .otherwise(span.headerValue.start(n('header_value_start')));

    if (this.isStrict) {
      n('header_value_discard_ws_almost_done')
        .match('\n', n('header_value_discard_lws'))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after CR'));
    } else {
      n('header_value_discard_ws_almost_done').skipTo(
        n('header_value_discard_lws'));
    }

    n('header_value_discard_lws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      .otherwise(this.setHeaderFlags(
        this.emptySpan(span.headerValue, 'header_field_start')));

    n('header_value_start')
      .otherwise(this.load('header_state', {
        [HEADER_STATE.UPGRADE]: this.setFlag(FLAGS.UPGRADE, fallback),
        [HEADER_STATE.TRANSFER_ENCODING]: n('header_value_te_chunked'),
        [HEADER_STATE.CONTENT_LENGTH]: n('header_value_content_length_once'),
        [HEADER_STATE.CONNECTION]: n('header_value_connection')
      }, 'header_value'));

    n('header_value_te_chunked')
      .transform(p.transform.toLowerUnsafe())
      .match(
        'chunked',
        this.update('header_state', HEADER_STATE.TRANSFER_ENCODING_CHUNKED,
          'header_value_discard_rws')
      )
      .peek([ ' ', '\r', '\n' ], n('header_value_discard_rws'))
      .otherwise(fallback);

    const invalidContentLength = (reason) => {
      // End span for easier testing
      // TODO(indutny): minimize code size
      return span.headerValue.end()
        .otherwise(p.error(ERROR.INVALID_CONTENT_LENGTH, reason));
    };

    n('header_value_content_length_once')
      .otherwise(this.testFlags(FLAGS.CONTENT_LENGTH, {
        0: n('header_value_content_length')
      }, p.error(ERROR.UNEXPECTED_CONTENT_LENGTH, 'Duplicate Content-Length')));

    n('header_value_content_length')
      .select(constants.NUM_MAP, this.mulAdd('content_length', {
        success: 'header_value_content_length',
        overflow: invalidContentLength('Content-Length overflow')
      }))
      .peek([ ' ', '\r', '\n' ],
        this.setFlag(FLAGS.CONTENT_LENGTH, 'header_value_discard_rws'))
      .otherwise(invalidContentLength('Invalid character in Content-Length'));

    n('header_value_connection')
      .transform(p.transform.toLowerUnsafe())
      // TODO(indutny): extra node for token back-edge?
      .match(' ', n('header_value_connection'))
      .match(
        'close',
        this.update('header_state', HEADER_STATE.CONNECTION_CLOSE,
          'header_value_connection_ws')
      )
      .match(
        'upgrade',
        this.update('header_state', HEADER_STATE.CONNECTION_UPGRADE,
          'header_value_connection_ws')
      )
      .match(
        'keep-alive',
        this.update('header_state', HEADER_STATE.CONNECTION_KEEP_ALIVE,
          'header_value_connection_ws')
      )
      .otherwise(n('header_value_connection_token'));

    n('header_value_connection_ws')
      .match(',', this.setHeaderFlags('header_value_connection'))
      .match(' ', n('header_value_connection_ws'))
      .peek([ '\r', '\n' ], n('header_value_otherwise'))
      .otherwise(this.resetHeaderState('header_value_connection_token'));

    n('header_value_connection_token')
      .match(',', n('header_value_connection'))
      .match(constants.CONNECTION_TOKEN_CHARS,
        n('header_value_connection_token'))
      .otherwise(n('header_value_otherwise'));

    n('header_value_discard_rws')
      .match(' ', n('header_value_discard_rws'))
      .peek([ '\r', '\n' ], n('header_value_otherwise'))
      .otherwise(fallback);

    // Split for performance reasons
    n('header_value')
      .match(constants.HEADER_CHARS, n('header_value'))
      .otherwise(n('header_value_otherwise'));

    n('header_value_otherwise')
      .peek('\r', span.headerValue.end().skipTo(n('header_value_almost_done')))
      .peek('\n', span.headerValue.end(n('header_value_almost_done')))
      // TODO(indutny): do we need `lenient` option? (it is always off now)
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN,
        'invalid header value char'));

    n('header_value_almost_done')
      .match('\n', n('header_value_lws'))
      .otherwise(p.error(ERROR.LF_EXPECTED,
        'Missing expected LF after header value'));

    n('header_value_lws')
      .peek([ ' ', '\t' ], n('header_value_start'))
      .otherwise(this.setHeaderFlags('header_field_start'));

    const checkTrailing = this.testFlags(FLAGS.TRAILING, {
      1: this.invokePausable('on_chunk_complete', 'message_done')
    });

    if (this.isStrict) {
      n('headers_almost_done')
        .match('\n', checkTrailing)
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after headers'));
    } else {
      n('headers_almost_done')
        .skipTo(checkTrailing);
    }

    /* Cannot use chunked encoding and a content-length header together
       per the HTTP specification. */
    const ENCODING_CONFLICT = FLAGS.CHUNKED | FLAGS.CONTENT_LENGTH;
    const checkEncConflict = this.testFlags(ENCODING_CONFLICT, {
      1: p.error(ERROR.UNEXPECTED_CONTENT_LENGTH,
        'Content-Length can\'t be present with chunked encoding')
    });

    checkTrailing.otherwise(checkEncConflict);

    // Set `upgrade` if needed
    const beforeHeadersComplete = p.invoke(callback.beforeHeadersComplete);

    /* Here we call the headers_complete callback. This is somewhat
     * different than other callbacks because if the user returns 1, we
     * will interpret that as saying that this message has no body. This
     * is needed for the annoying case of recieving a response to a HEAD
     * request.
     *
     * We'd like to use CALLBACK_NOTIFY_NOADVANCE() here but we cannot, so
     * we have to simulate it by handling a change in errno below.
     */
    const onHeadersComplete = p.invoke(callback.onHeadersComplete, {
      0: n('headers_done'),
      1: this.update('upgrade', 1,
        this.setFlag(FLAGS.SKIPBODY, 'headers_done')),
      2: this.update('upgrade', 1, 'headers_done'),
      [ERROR.PAUSED]: this.pause('paused by on_headers_complete',
        'headers_done')
    }, p.error(ERROR.CB_HEADERS_COMPLETE, 'User callback error'));

    checkEncConflict.otherwise(beforeHeadersComplete);
    beforeHeadersComplete.otherwise(onHeadersComplete);

    const pauseAfterConnect = this.pause('pause on CONNECT');

    const afterHeadersComplete = p.invoke(callback.afterHeadersComplete, {
      1: this.invokePausable('on_message_complete', pauseAfterConnect),
      2: n('chunk_size_start'),
      3: n('body_identity'),
      4: n('body_identity_eof')
    });

    n('headers_done')
      .otherwise(afterHeadersComplete);

    pauseAfterConnect
      .otherwise(n('cleanup'));

    afterHeadersComplete
      .otherwise(this.invokePausable('on_message_complete', 'cleanup'));

    n('body_identity')
      .otherwise(span.body.start()
        .otherwise(p.consume('content_length').otherwise(
          span.body.end(n('message_done')))));

    n('body_identity_eof')
      .otherwise(span.body.start(n('eof')));

    // Just read everything until EOF
    n('eof')
      .skipTo(n('eof'));

    n('chunk_size_start')
      .otherwise(this.update('content_length', 0, 'chunk_size'));

    n('chunk_size')
      .select(constants.HEX_MAP, this.mulAdd('content_length', {
        success: 'chunk_size',
        overflow: p.error(ERROR.INVALID_CHUNK_SIZE, 'Chunk size overflow')
      }, { base: 0x10 }))
      .otherwise(n('chunk_size_otherwise'));

    n('chunk_size_otherwise')
      .match('\r', n('chunk_size_almost_done'))
      .match([ ';', ' ' ], n('chunk_parameters'))
      .otherwise(p.error(ERROR.INVALID_CHUNK_SIZE,
        'Invalid character in chunk size'));

    // just ignore this.
    n('chunk_parameters')
      .match('\r', n('chunk_size_almost_done'))
      .skipTo(n('chunk_parameters'));

    if (this.isStrict) {
      n('chunk_size_almost_done')
        .match('\n', n('chunk_size_almost_done_lf'))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after chunk size'));
    } else {
      n('chunk_size_almost_done')
        .skipTo(n('chunk_size_almost_done_lf'));
    }

    const toChunk = this.isEqual('content_length', 0, {
      equal: this.setFlag(FLAGS.TRAILING, 'header_field_start'),
      notEqual: 'chunk_data'
    });

    n('chunk_size_almost_done_lf')
      .otherwise(this.invokePausable('on_chunk_header', toChunk));

    n('chunk_data')
      .otherwise(span.body.start()
        .otherwise(p.consume('content_length').otherwise(
          span.body.end(n('chunk_data_almost_done')))));

    if (this.isStrict) {
      n('chunk_data_almost_done')
        .match('\r\n', n('chunk_complete'))
        .otherwise(p.error(ERROR.STRICT, 'Expected CRLF after chunk'));
    } else {
      n('chunk_data_almost_done')
        .skipTo(n('chunk_data_almost_done_skip'));
    }

    n('chunk_data_almost_done_skip')
      .skipTo(n('chunk_complete'));

    n('chunk_complete')
      .otherwise(this.invokePausable('on_chunk_complete', 'chunk_size_start'));

    n('message_done')
      .otherwise(this.invokePausable('on_message_complete', 'cleanup'));

    // Check if we'd like to keep-alive
    n('cleanup')
      .otherwise(p.invoke(callback.afterMessageComplete, {
        1: n('restart')
      }, n('closed')));

    n('closed')
      .match([ '\r', '\n' ], n('closed'))
      .skipTo(p.error(ERROR.CLOSED_CONNECTION,
        'Data after `Connection: close`'));

    n('restart')
      .otherwise(n('start'));
  }
}
module.exports = HTTP;
