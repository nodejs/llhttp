'use strict';

const assert = require('assert');

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;
const SPECIAL_HEADERS = constants.SPECIAL_HEADERS;

const NODES = [
  'start_req',
  'start_res',
  'start_req_or_res',
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
  'header_value_discard_ws',
  'header_value_discard_lws',
  'header_value_start',
  'header_value',
  'header_value_char',
  'header_value_lws',
  'header_almost_done',

  // TODO(indutny): rename this to avoid programmer error
  'headers_almost_done',

  'restart'
];

class HTTP {
  constructor(p, isStrict = false) {
    this.p = p;
    this.isStrict = isStrict;

    this.url = new llhttp.URL(p, isStrict);
    this.TOKEN = this.isStrict ? constants.STRICT_TOKEN : constants.TOKEN;

    this.span = {
      headerField: p.span(p.code.span('http_parser__on_header_field')),
      headerValue: p.span(p.code.span('http_parser__on_header_value'))
    };

    this.callback = {
      onFinishedHeader: p.code.match('http_parser__on_finished_header'),
      onHeadersComplete: p.code.match('http_parser__on_headers_complete')
    };

    this.nodes = new Map();
    NODES.forEach(name => this.nodes.set(name, p.node(name)));
  }

  node(name) {
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

  build() {
    const p = this.p;
    const span = this.span;
    const callback = this.callback;
    const n = name => this.node(name);

    p.property('i8', 'method');
    p.property('i8', 'req_http_major');
    p.property('i8', 'req_http_minor');
    p.property('i8', 'header_state');

    const url = this.url.build();

    n('start_req')
      .match('\r', n('start_req'))
      .match('\n', n('start_req'))
      .select(constants.METHODS, this.store('method', 'req_spaces_before_url'))
      .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

    n('start_res').skipTo(n('start_res'));
    n('start_req_or_res').skipTo(n('start_req_or_res'));

    n('req_spaces_before_url')
      .match(' ', n('req_spaces_before_url'))
      .otherwise(p.invoke(
        p.code.isEqual('method', constants.METHODS.CONNECT),
        {
          // CONNECT
          0: url.entry.connect,

          // Normal METHODS
          1: url.entry.normal
        },
        p.error(ERROR.INTERNAL,
          '`http_parser__is_connect` returned invalid value'))
      );


    url.exit.toHTTP
      .otherwise(n('req_http_start'));

    url.exit.toHTTP09
      .otherwise(
        this.update('req_http_major', 0)
          .otherwise(this.update('req_http_minor', 9, 'header_field_start'))
      );

    n('req_http_start')
      .match('HTTP/', n('req_http_major'))
      .match(' ', n('req_http_start'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

    n('req_http_major')
      .select(constants.MAJOR, this.store('req_http_major', 'req_http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('req_http_dot')
      .match('.', n('req_http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('req_http_minor')
      .select(constants.MINOR, this.store('req_http_minor', 'req_http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('req_http_end')
      .match([ '\r\n', '\n' ], n('header_field_start'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected CRLF after version'));

    n('header_field_start')
      .match('\r', n('headers_almost_done'))
      .peek('\n', n('headers_almost_done'))
      .otherwise(span.headerField.start(n('header_field')));

    n('header_field')
      .transform(p.transform.toLowerUnsafe())
      .select(SPECIAL_HEADERS, this.store('header_state', 'header_field_colon'))
      .otherwise(n('header_field_general'));

    n('header_field_colon')
      .match(' ', n('header_field_colon'))
      .peek(':', span.headerField.end().skipTo(
        n('header_value_discard_ws')))
      // Fallback to general header
      .otherwise(
        this.update('header_state', constants.GENERAL_HEADER,
          'header_field_general'));

    n('header_field_general')
      .match(this.TOKEN, n('header_field_general'))
      .peek(':', span.headerField.end().skipTo(n('header_value_discard_ws')))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));

    n('header_value_discard_ws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      .match('\n', n('header_value_discard_lws'))
      .otherwise(span.headerValue.start(n('header_value_start')));

    if (!this.isStrict)
      n('header_value_discard_ws').match('\r\n', n('header_value_discard_lws'));

    n('header_value_discard_lws')
      .match([ ' ', '\t' ], n('header_value_discard_lws'))
      // TODO(indutny): the callback should set `parser->flags`
      .otherwise(
        p.invoke(
          callback.onFinishedHeader,
          // Just empty value
          span.headerValue.start(span.headerValue.end(n('header_field_start')))
        ));

    // TODO(indutny): implement me
    n('header_value_start')
      .otherwise(this.load('header_state', {
        // TODO(indutny): `connection: close` and so on
      }, 'header_value'));

    n('header_value')
      .peek([ '\r', '\n' ], span.headerValue.end(n('header_almost_done')))
      // TODO(indutny): do we need `lenient` option?
      .match(constants.HEADER_CHARS, n('header_value_char'))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN,
        'invalid header value char'));

    // TODO(indutny): limit value size?
    n('header_value_char')
      .transform(p.transform.toLowerUnsafe())
      .skipTo(n('header_value'));

    n('header_almost_done')
      .match('\r\n', n('header_value_lws'))
      .match('\n', n('header_value_lws'))
      .otherwise(p.error(ERROR.LF_EXPECTED,
        'Missing expected LF after header value'));

    n('header_value_lws')
      .peek([ ' ', '\t' ], n('header_value_start'))
      // TODO(indutny): the callback should set `parser->flags`
      .otherwise(p.invoke(callback.onFinishedHeader, n('header_field_start')));

    // TODO(indutny): implement me
    if (this.isStrict) {
      n('headers_almost_done')
        .peek('\r', p.invoke(callback.onHeadersComplete, n('restart')))
        .otherwise(p.error(ERROR.STRICT, 'Expected LF after headers'));
    } else {
      n('headers_almost_done')
        .otherwise(p.invoke(callback.onHeadersComplete, n('restart')));
    }

    return {
      entry: {
        req: n('start_req'),
        res: n('start_res'),
        reqOrRes: n('start_req_or_res')
      },
      exit: {
        restart: n('restart')
      }
    };
  }
}
module.exports = HTTP;
