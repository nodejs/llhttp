'use strict';

const assert = require('assert');

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

const NODES = [
  'start_req',
  'start_res',
  'start_req_or_res',
  'req_spaces_before_url',
  'http_start',
  'http_major',
  'http_dot',
  'http_minor',
  'http_end',
  'header_field_start',
  'header_field',
  'header_field_colon',
  'header_field_general',
  'header_value_discard_ws',
  'header_value_discard_lws',
  'header_value_start',
  'headers_almost_done'
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

    this.nodes = new Map();
    NODES.forEach(name => this.nodes.set(name, p.node(name)));
  }

  node(name) {
    assert(this.nodes.has(name), 'Unknown node: ' + name);
    return this.nodes.get(name);
  }

  store(name, next) {
    return this.p.invoke(this.p.code.store(name), this.node(next));
  }

  build() {
    const p = this.p;
    const n = name => this.node(name);

    p.property('i8', 'method');
    p.property('i8', 'http_major');
    p.property('i8', 'http_minor');

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
        p.code.isEqual('method', constants.METHOD.CONNECT),
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
      .otherwise(n('http_start'));

    url.exit.toHTTP09
      .otherwise(
        p.invoke(
          p.code.update('http_major', 0)
        ).otherwise(
          p.invoke(p.code.update('http_minor', 9), n('header_field_start'))
        )
      );

    n('http_start')
      // TODO(indutny): non-strict mode didn't care about the rest
      .match('HTTP/', n('http_major'))
      .match(' ', n('http_start'))
      .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

    n('http_major')
      .select(constants.MAJOR, this.store('http_major', 'http_dot'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

    n('http_dot')
      .match('.', n('http_minor'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

    n('http_minor')
      .select(constants.MINOR, this.store('http_minor', 'http_end'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

    n('http_end')
      .match([ '\r\n', '\n' ], n('header_field_start'))
      .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected CRLF after version'));

    n('header_field_start')
      .match('\r', n('headers_almost_done'))
      .peek('\n', n('headers_almost_done'))
      .otherwise(this.span.headerField.start(n('header_field')));

    n('header_field')
      .transform(p.transform.toLowerUnsafe())
      .select(
        {
          'proxy-connection': 0,
          'connection': 1,
          'content-length': 2,
          'transfer-encoding': 3,
          'upgrade': 4
        },
        p.invoke(
          p.code.value('http_parser__on_speific_header')
        ).otherwise(n('header_field_colon'))
      )
      .otherwise(n('header_field_general'));

    n('header_field_colon')
      .peek(':', this.span.headerField.end().skipTo(
        n('header_value_discard_ws')))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));

    n('header_field_general')
      .match(this.TOKEN, n('header_field_general'))
      .peek(':', this.span.headerField.end().skipTo(
        n('header_value_discard_ws')))
      .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));

    n('header_value_discard_ws')
      .match([ ' ', '\t' ], n('header_value_discard_ws'))
      // TODO(indutny): strict check
      .match('\r\n', n('header_value_discard_lws'))
      .otherwise(this.span.headerValue.start(n('header_value_start')));

    // TODO(indutny): implement me
    n('header_value_discard_lws')
      .skipTo(n('header_value_discard_lws'));

    // TODO(indutny): implement me
    n('header_value_start')
      .skipTo(n('header_value_start'));

    // TODO(indutny): implement me
    n('headers_almost_done')
      .skipTo(n('headers_almost_done'));

    return p.invoke(p.code.match('http_parser__start'), {
      0: n('start_req'),
      1: n('start_res'),
      2: n('start_req_or_res')
    }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
  }
}
module.exports = HTTP;
