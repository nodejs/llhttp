import * as assert from 'assert';
import { LLParse, source } from 'llparse';

import Match = source.node.Match;
import Node = source.node.Node;

import {
  CharList,
  CONNECTION_TOKEN_CHARS, ERROR, FINISH, FLAGS, H_METHOD_MAP, HEADER_CHARS,
  HEADER_STATE, HEX_MAP,
  HTTPMode,
  LENIENT_FLAGS,
  MAJOR, METHOD_MAP, METHODS, METHODS_HTTP, METHODS_ICE, METHODS_RTSP,
  MINOR, NUM_MAP, SPECIAL_HEADERS, STRICT_TOKEN,
  TOKEN, TYPE,
} from './constants';
import { URL } from './url';

type MaybeNode = string | Match | Node;

const NODES: ReadonlyArray<string> = [
  'start',
  'start_req',
  'start_res',
  'start_req_or_res',

  'req_or_res_method',

  'res_http_major',
  'res_http_dot',
  'res_http_minor',
  'res_http_end',
  'res_status_code',
  'res_status_code_otherwise',
  'res_status_start',
  'res_status',
  'res_line_almost_done',

  'req_first_space_before_url',
  'req_spaces_before_url',
  'req_http_start',
  'req_http_major',
  'req_http_dot',
  'req_http_minor',
  'req_http_end',
  'req_http_complete',

  'req_pri_upgrade',

  'header_field_start',
  'header_field',
  'header_field_colon',
  'header_field_colon_discard_ws',
  'header_field_general',
  'header_field_general_otherwise',
  'header_value_discard_ws',
  'header_value_discard_ws_almost_done',
  'header_value_discard_lws',
  'header_value_start',
  'header_value',
  'header_value_otherwise',
  'header_value_lenient',
  'header_value_lws',
  'header_value_te_chunked',
  'header_value_te_chunked_last',
  'header_value_te_token',
  'header_value_te_token_ows',
  'header_value_content_length_once',
  'header_value_content_length',
  'header_value_content_length_ws',
  'header_value_connection',
  'header_value_connection_ws',
  'header_value_connection_token',
  'header_value_almost_done',

  'headers_almost_done',
  'headers_done',

  'chunk_size_start',
  'chunk_size_digit',
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
  'restart',
];

interface ISpanMap {
  readonly body: source.Span;
  readonly headerField: source.Span;
  readonly headerValue: source.Span;
  readonly status: source.Span;
}

interface ICallbackMap {
  readonly afterHeadersComplete: source.code.Code;
  readonly afterMessageComplete: source.code.Code;
  readonly beforeHeadersComplete: source.code.Code;
  readonly onChunkComplete: source.code.Code;
  readonly onChunkHeader: source.code.Code;
  readonly onHeadersComplete: source.code.Code;
  readonly onMessageBegin: source.code.Code;
  readonly onMessageComplete: source.code.Code;
  readonly onUrlComplete: source.code.Code;
  readonly onStatusComplete: source.code.Code;
  readonly onHeaderFieldComplete: source.code.Code;
  readonly onHeaderValueComplete: source.code.Code;
}

interface IMulTargets {
  readonly overflow: string | Node;
  readonly success: string | Node;
}

interface IMulOptions {
  readonly base: number;
  readonly max?: number;
  readonly signed: boolean;
}

interface IIsEqualTargets {
  readonly equal: string | Node;
  readonly notEqual: string | Node;
}

export interface IHTTPResult {
  readonly entry: Node;
}

export class HTTP {
  private readonly url: URL;
  private readonly TOKEN: CharList;
  private readonly span: ISpanMap;
  private readonly callback: ICallbackMap;
  private readonly nodes: Map<string, Match> = new Map();

  constructor(private readonly llparse: LLParse,
              private readonly mode: HTTPMode = 'loose') {
    const p = llparse;

    this.url = new URL(p, mode);
    this.TOKEN = mode === 'strict' ? STRICT_TOKEN : TOKEN;

    this.span = {
      body: p.span(p.code.span('llhttp__on_body')),
      headerField: p.span(p.code.span('llhttp__on_header_field')),
      headerValue: p.span(p.code.span('llhttp__on_header_value')),
      status: p.span(p.code.span('llhttp__on_status')),
    };

    /* tslint:disable:object-literal-sort-keys */
    this.callback = {
      // User callbacks
      onUrlComplete: p.code.match('llhttp__on_url_complete'),
      onStatusComplete: p.code.match('llhttp__on_status_complete'),
      onHeaderFieldComplete: p.code.match('llhttp__on_header_field_complete'),
      onHeaderValueComplete: p.code.match('llhttp__on_header_value_complete'),
      onHeadersComplete: p.code.match('llhttp__on_headers_complete'),
      onMessageBegin: p.code.match('llhttp__on_message_begin'),
      onMessageComplete: p.code.match('llhttp__on_message_complete'),
      onChunkHeader: p.code.match('llhttp__on_chunk_header'),
      onChunkComplete: p.code.match('llhttp__on_chunk_complete'),

      // Internal callbacks `src/http.c`
      beforeHeadersComplete:
        p.code.match('llhttp__before_headers_complete'),
      afterHeadersComplete: p.code.match('llhttp__after_headers_complete'),
      afterMessageComplete: p.code.match('llhttp__after_message_complete'),
    };
    /* tslint:enable:object-literal-sort-keys */

    NODES.forEach((name) => this.nodes.set(name, p.node(name) as Match));
  }

  public build(): IHTTPResult {
    const p = this.llparse;

    p.property('i64', 'content_length');
    p.property('i8', 'type');
    p.property('i8', 'method');
    p.property('i8', 'http_major');
    p.property('i8', 'http_minor');
    p.property('i8', 'header_state');
    p.property('i8', 'lenient_flags');
    p.property('i8', 'upgrade');
    p.property('i8', 'finish');
    p.property('i16', 'flags');
    p.property('i16', 'status_code');

    // Verify defaults
    assert.strictEqual(FINISH.SAFE, 0);
    assert.strictEqual(TYPE.BOTH, 0);

    // Shared settings (to be used in C wrapper)
    p.property('ptr', 'settings');

    this.buildLine();
    this.buildHeaders();

    return {
      entry: this.node('start'),
    };
  }

  private buildLine(): void {
    const p = this.llparse;
    const span = this.span;
    const n = (name: string): Match => this.node<Match>(name);

    const url = this.url.build();

    const switchType = this.load('type', {
      [TYPE.REQUEST]: n('start_req'),
      [TYPE.RESPONSE]: n('start_res'),
    }, n('start_req_or_res'));

    n('start')
      .match([ '\r', '\n' ], n('start'))
      .otherwise(this.update('finish', FINISH.UNSAFE,
        this.invokePausable('on_message_begin',
          ERROR.CB_MESSAGE_BEGIN, switchType)));

    n('start_req_or_res')
      .peek('H', n('req_or_res_method'))
      .otherwise(this.update('type', TYPE.REQUEST, 'start_req'));

    n('req_or_res_method')
      .select(H_METHOD_MAP, this.store('method',
        this.update('type', TYPE.REQUEST, 'req_first_space_before_url')))
      .match('HTTP/', this.update('type', TYPE.RESPONSE, 'res_http_major'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Invalid word encountered'));

    // Response

    n('start_res')
      .match('HTTP/', n('res_http_major'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

    n('res_http_major')
      .select(MAJOR, this.store('http_major', 'res_http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('res_http_dot')
      .match('.', n('res_http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('res_http_minor')
      .select(MINOR, this.store('http_minor', 'res_http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('res_http_end')
      .match(' ', this.update('status_code', 0, 'res_status_code'))
      .otherwise(p.error(ERROR.INVALID_VERSION,
          'Expected space after version'));

    n('res_status_code')
      .select(NUM_MAP, this.mulAdd('status_code', {
        overflow: p.error(ERROR.INVALID_STATUS, 'Response overflow'),
        success: 'res_status_code',
      }, { base: 10, signed: false, max: 999 }))
      .otherwise(n('res_status_code_otherwise'));

    n('res_status_code_otherwise')
      .match(' ', n('res_status_start'))
      .peek([ '\r', '\n' ], n('res_status_start'))
      .otherwise(p.error(ERROR.INVALID_STATUS, 'Invalid response status'));

    const onStatusComplete = p.invoke(this.callback.onStatusComplete);
    onStatusComplete.otherwise(n('header_field_start'));

    n('res_status_start')
      .match('\r', n('res_line_almost_done'))
      .match('\n', onStatusComplete)
      .otherwise(span.status.start(n('res_status')));

    n('res_status')
      .peek('\r', span.status.end().skipTo(n('res_line_almost_done')))
      .peek('\n', span.status.end().skipTo(onStatusComplete))
      .skipTo(n('res_status'));

    if (this.mode === 'strict') {
      n('res_line_almost_done')
        .match('\n', onStatusComplete)
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after CR'));
    } else {
      n('res_line_almost_done')
        .skipTo(onStatusComplete);
    }

    // Request

    n('start_req')
      .select(METHOD_MAP,
        this.store('method', 'req_first_space_before_url'))
      .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

    n('req_first_space_before_url')
      .match(' ', n('req_spaces_before_url'))
      .otherwise(p.error(ERROR.INVALID_METHOD, 'Expected space after method'));

    n('req_spaces_before_url')
      .match(' ', n('req_spaces_before_url'))
      .otherwise(this.isEqual('method', METHODS.CONNECT, {
        equal: url.entry.connect,
        notEqual: url.entry.normal,
      }));

    const onUrlCompleteHTTP = p.invoke(this.callback.onUrlComplete);
    onUrlCompleteHTTP.otherwise(n('req_http_start'));

    url.exit.toHTTP
      .otherwise(onUrlCompleteHTTP);

    const onUrlCompleteHTTP09 = p.invoke(this.callback.onUrlComplete);
    onUrlCompleteHTTP09.otherwise(n('header_field_start'));

    url.exit.toHTTP09
      .otherwise(
        this.update('http_major', 0,
          this.update('http_minor', 9, onUrlCompleteHTTP09)),
      );

    const checkMethod = (methods: METHODS[], error: string): Node => {
      const success = n('req_http_major');
      const failure = p.error(ERROR.INVALID_CONSTANT, error);

      const map: { [key: number]: Node } = {};
      for (const method of methods) {
        map[method] = success;
      }

      return this.load('method', map, failure);
    };

    n('req_http_start')
      .match('HTTP/', checkMethod(METHODS_HTTP,
        'Invalid method for HTTP/x.x request'))
      .match('RTSP/', checkMethod(METHODS_RTSP,
        'Invalid method for RTSP/x.x request'))
      .match('ICE/', checkMethod(METHODS_ICE,
        'Expected SOURCE method for ICE/x.x request'))
      .match(' ', n('req_http_start'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

    n('req_http_major')
      .select(MAJOR, this.store('http_major', 'req_http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('req_http_dot')
      .match('.', n('req_http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('req_http_minor')
      .select(MINOR, this.store('http_minor', 'req_http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('req_http_end').otherwise(this.load('method', {
      [METHODS.PRI]: n('req_pri_upgrade'),
    }, n('req_http_complete')));

    n('req_http_complete')
      .match([ '\r\n', '\n' ], n('header_field_start'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected CRLF after version'));

    n('req_pri_upgrade')
      .match('\r\n\r\nSM\r\n\r\n',
        p.error(ERROR.PAUSED_H2_UPGRADE, 'Pause on PRI/Upgrade'))
      .otherwise(
        p.error(ERROR.INVALID_VERSION, 'Expected HTTP/2 Connection Preface'));
  }

  private buildHeaders(): void {
    this.buildHeaderField();
    this.buildHeaderValue();
  }

  private buildHeaderField(): void {
    const p = this.llparse;
    const span = this.span;
    const n = (name: string): Match => this.node<Match>(name);

    n('header_field_start')
      .match('\r', n('headers_almost_done'))
      /* they might be just sending \n instead of \r\n so this would be
       * the second \n to denote the end of headers*/
      .peek('\n', n('headers_almost_done'))
      .otherwise(span.headerField.start(n('header_field')));

    n('header_field')
      .transform(p.transform.toLower())
      // Match headers that need special treatment
      .select(SPECIAL_HEADERS, this.store('header_state', 'header_field_colon'))
      .otherwise(this.resetHeaderState('header_field_general'));

    const onHeaderFieldComplete = p.invoke(this.callback.onHeaderFieldComplete);
    onHeaderFieldComplete.otherwise(n('header_value_discard_ws'));

    const onInvalidHeaderFieldChar =
      p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header field char');

    const checkLenientFlagsOnColon =
      this.testLenientFlags(LENIENT_FLAGS.HEADERS, {
        1: n('header_field_colon_discard_ws'),
      }, span.headerField.end().skipTo(onInvalidHeaderFieldChar));

    n('header_field_colon')
      // https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.4
      // Whitespace character is not allowed between the header field-name
      // and colon. If the next token matches whitespace then throw an error.
      //
      // Add a check for the lenient flag. If the lenient flag is set, the
      // whitespace token is allowed to support legacy code not following
      // http specs.
      .peek(' ', checkLenientFlagsOnColon)
      .peek(':', span.headerField.end().skipTo(onHeaderFieldComplete))
      // Fallback to general header, there're additional characters:
      // `Connection-Duration` instead of `Connection` and so on.
      .otherwise(this.resetHeaderState('header_field_general'));

    n('header_field_colon_discard_ws')
      .match(' ', n('header_field_colon_discard_ws'))
      .otherwise(n('header_field_colon'));

    n('header_field_general')
      .match(this.TOKEN, n('header_field_general'))
      .otherwise(n('header_field_general_otherwise'));

    // Just a performance optimization, split the node so that the fast case
    // remains in `header_field_general`
    n('header_field_general_otherwise')
      .peek(':', span.headerField.end().skipTo(onHeaderFieldComplete))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));
  }

  private buildHeaderValue(): void {
    const p = this.llparse;
    const span = this.span;
    const callback = this.callback;
    const n = (name: string): Match => this.node<Match>(name);

    const fallback = this.resetHeaderState('header_value');

    n('header_value_discard_ws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      .match('\r', n('header_value_discard_ws_almost_done'))
      .match('\n', n('header_value_discard_lws'))
      .otherwise(span.headerValue.start(n('header_value_start')));

    if (this.mode === 'strict') {
      n('header_value_discard_ws_almost_done')
        .match('\n', n('header_value_discard_lws'))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after CR'));
    } else {
      n('header_value_discard_ws_almost_done').skipTo(
        n('header_value_discard_lws'));
    }

    const onHeaderValueComplete = p.invoke(this.callback.onHeaderValueComplete);
    onHeaderValueComplete.otherwise(n('header_field_start'));

    const emptyContentLengthError = p.error(
      ERROR.INVALID_CONTENT_LENGTH, 'Empty Content-Length');
    const checkContentLengthEmptiness = this.load('header_state', {
      [HEADER_STATE.CONTENT_LENGTH]: emptyContentLengthError,
    }, this.setHeaderFlags(
      this.emptySpan(span.headerValue, onHeaderValueComplete)));

    n('header_value_discard_lws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      .otherwise(checkContentLengthEmptiness);

    // Multiple `Transfer-Encoding` headers should be treated as one, but with
    // values separate by a comma.
    //
    // See: https://tools.ietf.org/html/rfc7230#section-3.2.2
    const toTransferEncoding = this.unsetFlag(
      FLAGS.CHUNKED,
      'header_value_te_chunked');

    n('header_value_start')
      .otherwise(this.load('header_state', {
        [HEADER_STATE.UPGRADE]: this.setFlag(FLAGS.UPGRADE, fallback),
        [HEADER_STATE.TRANSFER_ENCODING]: this.setFlag(
          FLAGS.TRANSFER_ENCODING, toTransferEncoding),
        [HEADER_STATE.CONTENT_LENGTH]: n('header_value_content_length_once'),
        [HEADER_STATE.CONNECTION]: n('header_value_connection'),
      }, 'header_value'));

    //
    // Transfer-Encoding
    //

    n('header_value_te_chunked')
      .transform(p.transform.toLowerUnsafe())
      .match(
        'chunked',
        n('header_value_te_chunked_last'),
      )
      .otherwise(n('header_value_te_token'));

    n('header_value_te_chunked_last')
      .match(' ', n('header_value_te_chunked_last'))
      .peek([ '\r', '\n' ], this.update('header_state',
        HEADER_STATE.TRANSFER_ENCODING_CHUNKED,
        'header_value_otherwise'))
      .otherwise(n('header_value_te_chunked'));

    n('header_value_te_token')
      .match(',', n('header_value_te_token_ows'))
      .match(CONNECTION_TOKEN_CHARS, n('header_value_te_token'))
      .otherwise(fallback);

    n('header_value_te_token_ows')
      .match([ ' ', '\t' ], n('header_value_te_token_ows'))
      .otherwise(n('header_value_te_chunked'));

    //
    // Content-Length
    //

    const invalidContentLength = (reason: string): Node => {
      // End span for easier testing
      // TODO(indutny): minimize code size
      return span.headerValue.end()
        .otherwise(p.error(ERROR.INVALID_CONTENT_LENGTH, reason));
    };

    n('header_value_content_length_once')
      .otherwise(this.testFlags(FLAGS.CONTENT_LENGTH, {
        0: n('header_value_content_length'),
      }, p.error(ERROR.UNEXPECTED_CONTENT_LENGTH, 'Duplicate Content-Length')));

    n('header_value_content_length')
      .select(NUM_MAP, this.mulAdd('content_length', {
        overflow: invalidContentLength('Content-Length overflow'),
        success: 'header_value_content_length',
      }))
      .otherwise(n('header_value_content_length_ws'));

    n('header_value_content_length_ws')
      .match(' ', n('header_value_content_length_ws'))
      .peek([ '\r', '\n' ],
          this.setFlag(FLAGS.CONTENT_LENGTH, 'header_value_otherwise'))
      .otherwise(invalidContentLength('Invalid character in Content-Length'));

    //
    // Connection
    //

    n('header_value_connection')
      .transform(p.transform.toLower())
      // TODO(indutny): extra node for token back-edge?
      // Skip lws
      .match([ ' ', '\t' ], n('header_value_connection'))
      .match(
        'close',
        this.update('header_state', HEADER_STATE.CONNECTION_CLOSE,
          'header_value_connection_ws'),
      )
      .match(
        'upgrade',
        this.update('header_state', HEADER_STATE.CONNECTION_UPGRADE,
          'header_value_connection_ws'),
      )
      .match(
        'keep-alive',
        this.update('header_state', HEADER_STATE.CONNECTION_KEEP_ALIVE,
          'header_value_connection_ws'),
      )
      .otherwise(n('header_value_connection_token'));

    n('header_value_connection_ws')
      .match(',', this.setHeaderFlags('header_value_connection'))
      .match(' ', n('header_value_connection_ws'))
      .peek([ '\r', '\n' ], n('header_value_otherwise'))
      .otherwise(this.resetHeaderState('header_value_connection_token'));

    n('header_value_connection_token')
      .match(',', n('header_value_connection'))
      .match(CONNECTION_TOKEN_CHARS,
        n('header_value_connection_token'))
      .otherwise(n('header_value_otherwise'));

    // Split for performance reasons
    n('header_value')
      .match(HEADER_CHARS, n('header_value'))
      .otherwise(n('header_value_otherwise'));

    const checkLenient = this.testLenientFlags(LENIENT_FLAGS.HEADERS, {
      1: n('header_value_lenient'),
    }, p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header value char'));

    n('header_value_otherwise')
      .peek('\r', span.headerValue.end().skipTo(n('header_value_almost_done')))
      .peek('\n', span.headerValue.end(n('header_value_almost_done')))
      .otherwise(checkLenient);

    n('header_value_lenient')
      .peek('\r', span.headerValue.end().skipTo(n('header_value_almost_done')))
      .peek('\n', span.headerValue.end(n('header_value_almost_done')))
      .skipTo(n('header_value_lenient'));

    n('header_value_almost_done')
      .match('\n', n('header_value_lws'))
      .otherwise(p.error(ERROR.LF_EXPECTED,
        'Missing expected LF after header value'));

    n('header_value_lws')
      .peek([ ' ', '\t' ], span.headerValue.start(n('header_value_start')))
      .otherwise(this.setHeaderFlags(onHeaderValueComplete));

    const checkTrailing = this.testFlags(FLAGS.TRAILING, {
      1: this.invokePausable('on_chunk_complete',
        ERROR.CB_CHUNK_COMPLETE, 'message_done'),
    });

    if (this.mode === 'strict') {
      n('headers_almost_done')
        .match('\n', checkTrailing)
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after headers'));
    } else {
      n('headers_almost_done')
        .skipTo(checkTrailing);
    }

    // Set `upgrade` if needed
    const beforeHeadersComplete = p.invoke(callback.beforeHeadersComplete);

    /* Present `Transfer-Encoding` header overrides `Content-Length` even if the
     * actual coding is not `chunked`. As per spec:
     *
     * https://www.rfc-editor.org/rfc/rfc7230.html#section-3.3.3
     *
     * If a message is received with both a Transfer-Encoding and a
     * Content-Length header field, the Transfer-Encoding overrides the
     * Content-Length.  Such a message might indicate an attempt to
     * perform request smuggling (Section 9.5) or response splitting
     * (Section 9.4) and **ought to be handled as an error**.  A sender MUST
     * remove the received Content-Length field prior to forwarding such
     * a message downstream.
     *
     * (Note our emphasis on **ought to be handled as an error**
     */

    const ENCODING_CONFLICT = FLAGS.TRANSFER_ENCODING | FLAGS.CONTENT_LENGTH;

    const onEncodingConflict =
      this.testLenientFlags(LENIENT_FLAGS.CHUNKED_LENGTH, {
        0: p.error(ERROR.UNEXPECTED_CONTENT_LENGTH,
          'Content-Length can\'t be present with Transfer-Encoding'),

        // For LENIENT mode fall back to past behavior:
        // Ignore `Transfer-Encoding` when `Content-Length` is present.
      }).otherwise(beforeHeadersComplete);

    const checkEncConflict = this.testFlags(ENCODING_CONFLICT, {
      1: onEncodingConflict,
    }).otherwise(beforeHeadersComplete);

    checkTrailing.otherwise(checkEncConflict);

    /* Here we call the headers_complete callback. This is somewhat
     * different than other callbacks because if the user returns 1, we
     * will interpret that as saying that this message has no body. This
     * is needed for the annoying case of receiving a response to a HEAD
     * request.
     *
     * We'd like to use CALLBACK_NOTIFY_NOADVANCE() here but we cannot, so
     * we have to simulate it by handling a change in errno below.
     */
    const onHeadersComplete = p.invoke(callback.onHeadersComplete, {
      0: n('headers_done'),
      1: this.setFlag(FLAGS.SKIPBODY, 'headers_done'),
      2: this.update('upgrade', 1,
        this.setFlag(FLAGS.SKIPBODY, 'headers_done')),
      [ERROR.PAUSED]: this.pause('Paused by on_headers_complete',
        'headers_done'),
    }, p.error(ERROR.CB_HEADERS_COMPLETE, 'User callback error'));

    beforeHeadersComplete.otherwise(onHeadersComplete);

    const upgradePause = p.pause(ERROR.PAUSED_UPGRADE,
      'Pause on CONNECT/Upgrade');

    const afterHeadersComplete = p.invoke(callback.afterHeadersComplete, {
      1: this.invokePausable('on_message_complete',
        ERROR.CB_MESSAGE_COMPLETE, upgradePause),
      2: n('chunk_size_start'),
      3: n('body_identity'),
      4: n('body_identity_eof'),

      // non-chunked `Transfer-Encoding` for request, see `src/native/http.c`
      5: p.error(ERROR.INVALID_TRANSFER_ENCODING,
        'Request has invalid `Transfer-Encoding`'),
    });

    n('headers_done')
      .otherwise(afterHeadersComplete);

    upgradePause
      .otherwise(n('cleanup'));

    afterHeadersComplete
      .otherwise(this.invokePausable('on_message_complete',
        ERROR.CB_MESSAGE_COMPLETE, 'cleanup'));

    n('body_identity')
      .otherwise(span.body.start()
        .otherwise(p.consume('content_length').otherwise(
          span.body.end(n('message_done')))));

    n('body_identity_eof')
      .otherwise(
        this.update('finish', FINISH.SAFE_WITH_CB, span.body.start(n('eof'))));

    // Just read everything until EOF
    n('eof')
      .skipTo(n('eof'));

    n('chunk_size_start')
      .otherwise(this.update('content_length', 0, 'chunk_size_digit'));

    const addContentLength = this.mulAdd('content_length', {
      overflow: p.error(ERROR.INVALID_CHUNK_SIZE, 'Chunk size overflow'),
      success: 'chunk_size',
    }, { signed: false, base: 0x10 });

    n('chunk_size_digit')
      .select(HEX_MAP, addContentLength)
      .otherwise(p.error(ERROR.INVALID_CHUNK_SIZE,
        'Invalid character in chunk size'));

    n('chunk_size')
      .select(HEX_MAP, addContentLength)
      .otherwise(n('chunk_size_otherwise'));

    n('chunk_size_otherwise')
      .match('\r', n('chunk_size_almost_done'))
      .match([ ';', ' ' ], n('chunk_parameters'))
      .otherwise(p.error(ERROR.INVALID_CHUNK_SIZE,
        'Invalid character in chunk size'));

    n('chunk_parameters')
      .match('\r', n('chunk_size_almost_done'))
      .match(HEADER_CHARS, n('chunk_parameters'))
      .otherwise(p.error(ERROR.STRICT,
        'Invalid character in chunk parameters'));

    if (this.mode === 'strict') {
      n('chunk_size_almost_done')
        .match('\n', n('chunk_size_almost_done_lf'))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after chunk size'));
    } else {
      n('chunk_size_almost_done')
        .skipTo(n('chunk_size_almost_done_lf'));
    }

    const toChunk = this.isEqual('content_length', 0, {
      equal: this.setFlag(FLAGS.TRAILING, 'header_field_start'),
      notEqual: 'chunk_data',
    });

    n('chunk_size_almost_done_lf')
      .otherwise(this.invokePausable('on_chunk_header',
        ERROR.CB_CHUNK_HEADER, toChunk));

    n('chunk_data')
      .otherwise(span.body.start()
        .otherwise(p.consume('content_length').otherwise(
          span.body.end(n('chunk_data_almost_done')))));

    if (this.mode === 'strict') {
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
      .otherwise(this.invokePausable('on_chunk_complete',
        ERROR.CB_CHUNK_COMPLETE, 'chunk_size_start'));

    const upgradeAfterDone = this.isEqual('upgrade', 1, {
      // Exit, the rest of the message is in a different protocol.
      equal: upgradePause,

      // Restart
      notEqual: 'cleanup',
    });

    n('message_done')
      .otherwise(this.invokePausable('on_message_complete',
        ERROR.CB_MESSAGE_COMPLETE, upgradeAfterDone));

    const lenientClose = this.testLenientFlags(LENIENT_FLAGS.KEEP_ALIVE, {
      1: n('restart'),
    }, n('closed'));

    // Check if we'd like to keep-alive
    n('cleanup')
      .otherwise(p.invoke(callback.afterMessageComplete, {
        1: n('restart'),
      }, this.update('finish', FINISH.SAFE, lenientClose)));

    if (this.mode === 'strict') {
      // Error on extra data after `Connection: close`
      n('closed')
        .match([ '\r', '\n' ], n('closed'))
        .skipTo(p.error(ERROR.CLOSED_CONNECTION,
          'Data after `Connection: close`'));
    } else {
      // Discard all data after `Connection: close`
      n('closed').skipTo(n('closed'));
    }

    n('restart')
      .otherwise(this.update('finish', FINISH.SAFE, n('start')));
  }

  private node<T extends Node>(name: string | T): T {
    if (name instanceof Node) {
      return name;
    }

    assert(this.nodes.has(name), `Unknown node with name "${name}"`);
    return this.nodes.get(name)! as any;
  }

  private load(field: string, map: { [key: number]: Node },
               next?: string | Node): Node {
    const p = this.llparse;

    const res = p.invoke(p.code.load(field), map);
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  private store(field: string, next?: string | Node): Node {
    const p = this.llparse;

    const res = p.invoke(p.code.store(field));
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  private update(field: string, value: number, next?: string | Node): Node {
    const p = this.llparse;

    const res = p.invoke(p.code.update(field, value));
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  private resetHeaderState(next: string | Node): Node {
    return this.update('header_state', HEADER_STATE.GENERAL, next);
  }

  private emptySpan(span: source.Span, next: string | Node): Node {
    return span.start(span.end(this.node(next)));
  }

  private unsetFlag(flag: FLAGS, next: string | Node): Node {
    const p = this.llparse;
    return p.invoke(p.code.and('flags', ~flag), this.node(next));
  }

  private setFlag(flag: FLAGS, next: string | Node): Node {
    const p = this.llparse;
    return p.invoke(p.code.or('flags', flag), this.node(next));
  }

  private testFlags(flag: FLAGS, map: { [key: number]: Node },
                    next?: string | Node): Node {
    const p = this.llparse;
    const res = p.invoke(p.code.test('flags', flag), map);
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  private testLenientFlags(flag: LENIENT_FLAGS, map: { [key: number]: Node },
                           next?: string | Node): Node {
    const p = this.llparse;
    const res = p.invoke(p.code.test('lenient_flags', flag), map);
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  private setHeaderFlags(next: string | Node): Node {
    const HS = HEADER_STATE;
    const F = FLAGS;

    const toConnection =
      this.update('header_state', HEADER_STATE.CONNECTION, next);

    return this.load('header_state', {
      [HS.CONNECTION_KEEP_ALIVE]:
        this.setFlag(F.CONNECTION_KEEP_ALIVE, toConnection),
      [HS.CONNECTION_CLOSE]: this.setFlag(F.CONNECTION_CLOSE, toConnection),
      [HS.CONNECTION_UPGRADE]: this.setFlag(F.CONNECTION_UPGRADE, toConnection),
      [HS.TRANSFER_ENCODING_CHUNKED]: this.setFlag(F.CHUNKED, next),
    }, this.node(next));
  }

  private mulAdd(field: string, targets: IMulTargets,
                 options: IMulOptions = { base: 10, signed: false }): Node {
    const p = this.llparse;

    return p.invoke(p.code.mulAdd(field, options), {
      1: this.node(targets.overflow),
    }, this.node(targets.success));
  }

  private isEqual(field: string, value: number, map: IIsEqualTargets) {
    const p = this.llparse;
    return p.invoke(p.code.isEqual(field, value), {
      0: this.node(map.notEqual),
    }, this.node(map.equal));
  }

  private pause(msg: string, next?: string | Node) {
    const p = this.llparse;
    const res = p.pause(ERROR.PAUSED, msg);
    if (next !== undefined) {
      res.otherwise(this.node(next));
    }
    return res;
  }

  // TODO(indutny): use type for `name`
  private invokePausable(name: string, errorCode: ERROR, next: string | Node)
    : Node {
    let cb;
    if (name === 'on_message_begin') {
      cb = this.callback.onMessageBegin;
    } else if (name === 'on_message_complete') {
      cb = this.callback.onMessageComplete;
    } else if (name === 'on_chunk_header') {
      cb = this.callback.onChunkHeader;
    } else if (name === 'on_chunk_complete') {
      cb = this.callback.onChunkComplete;
    } else {
      throw new Error('Unknown callback: ' + name);
    }

    const p = this.llparse;
    return p.invoke(cb, {
      0: this.node(next),
      [ERROR.PAUSED]: this.pause(`${name} pause`, next),
    }, p.error(errorCode, `\`${name}\` callback error`));
  }
}
