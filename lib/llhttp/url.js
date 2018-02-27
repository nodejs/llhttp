'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

class URL {
  constructor(p, isStrict = false) {
    this.p = p;
    this.isStrict = isStrict;

    this.errorInvalid = p.error(ERROR.INVALID_URL, 'Invalid characters in url');
    this.errorStrictInvalid =
      p.error(ERROR.INVALID_URL, 'Invalid characters in url (strict)');

    this.URL_CHAR = this.isStrict ? constants.STRICT_URL_CHAR :
      constants.URL_CHAR;
  }

  node(name) {
    const res = this.p.node('url_' + name);

    if (this.isStrict)
      res.match([ '\t', '\f' ], this.errorStrictInvalid);

    return res;
  }

  build() {
    const p = this.p;

    const span = p.span(p.code.span('http_parser__on_url'));

    const entry = {
      normal: this.node('entry_normal'),
      connect: this.node('entry_connect')
    };

    const start = this.node('start');
    const path = this.node('path');
    const schema = this.node('schema');
    const server = this.node('server');
    const queryStart = this.node('query_start');
    const query = this.node('query');
    const fragment = this.node('fragment');
    const serverWithAt = this.node('server_with_at');

    entry.normal
      .otherwise(span.start(start));

    entry.connect
      .otherwise(span.start(server));

    start
      .match([ '/', '*' ], path)
      .match(constants.ALPHA, schema)
      .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected start char in url'));

    schema
      .match(constants.ALPHA, schema)
      .match('://', server)
      .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url schema'));

    [
      server,
      serverWithAt
    ].forEach((node) => {
      node
        .match('/', path)
        .match('?', query)
        .match(constants.USERINFO_CHARS, server)
        .match([ '[', ']' ], server)
        .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url server'));

      if (node !== serverWithAt)
        node.match('@', serverWithAt);
    });

    serverWithAt
      .match('@', p.error(ERROR.INVALID_URL, 'Double @ in url'));

    path
      .match(this.URL_CHAR, path)
      .match('?', query)
      .match('#', fragment)
      .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url path'));

    query
      .match(this.URL_CHAR, query)
      // Allow extra '?' in query string
      .match('?', query)
      .match('#', fragment)
      .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url query'));

    fragment
      .match(this.URL_CHAR, fragment)
      .match('?', fragment)
      .match('#', fragment)
      .otherwise(
        p.error(ERROR.INVALID_URL, 'Invalid char in url fragment start'));

    [ start, schema ].forEach((node) => {
      node.match([ ' ', '\r', '\n' ], this.errorInvalid);
    });

    // Adaptors
    const toHTTP = this.node('to_http');
    const toHTTP09 = this.node('to_http_09');

    const skipToHTTP = this.node('skip_to_http')
      .skipTo(toHTTP);

    const skipToHTTP09 = this.node('skip_to_http09')
      .skipTo(toHTTP09);

    const skipCRLF = this.node('skip_lf_to_http09')
      .match('\r\n', toHTTP09)
      .otherwise(p.error(ERROR.INVALID_URL, 'Expected CRLF'));

    [
      server, serverWithAt, path, queryStart, query,
      fragment
    ].forEach((node) => {
      node.peek(' ', span.end(skipToHTTP));

      node.peek('\r', span.end(skipCRLF));
      node.peek('\n', span.end(skipToHTTP09));
    });

    return {
      entry,
      exit: {
        toHTTP,
        toHTTP09
      }
    };
  }
}
module.exports = URL;
