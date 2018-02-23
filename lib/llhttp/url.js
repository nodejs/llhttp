'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p, isStrict = false) => {
  const errorInvalid = p.error(ERROR.INVALID_URL, 'Invalid characters in url');
  const errorStrictInvalid =
    p.error(ERROR.INVALID_URL, 'Invalid characters in url (strict)');

  const span = p.span(p.code.span('http_parser__on_url'));

  const node = (name) => {
    const res = p.node('url_' + name);

    if (isStrict)
      res.match([ '\t', '\f' ], errorStrictInvalid);

    return res;
  };

  const URL_CHAR = isStrict ? constants.STRICT_URL_CHAR : constants.URL_CHAR;

  const entry = {
    normal: node('entry_normal'),
    connect: node('entry_connect')
  };

  const start = node('start');
  const path = node('path');
  const schema = node('schema');
  const server = node('server');
  const queryStart = node('query_start');
  const query = node('query');
  const fragment = node('fragment');
  const serverWithAt = node('server_with_at');

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
    .match(URL_CHAR, path)
    .match('?', query)
    .match('#', fragment)
    .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url path'));

  query
    .match(URL_CHAR, query)
    // Allow extra '?' in query string
    .match('?', query)
    .match('#', fragment)
    .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url query'));

  fragment
    .match(URL_CHAR, fragment)
    .match('?', fragment)
    .match('#', fragment)
    .otherwise(
      p.error(ERROR.INVALID_URL, 'Invalid char in url fragment start'));

  [ start, schema ].forEach((node) => {
    node.match([ ' ', '\r', '\n' ], errorInvalid);
  });

  // Adaptors
  const toHTTP = node('to_http');
  const toHTTP09 = node('to_http_09');

  const skipToHTTP = node('skip_to_http')
    .skipTo(toHTTP);

  const skipToHTTP09 = node('skip_to_http09')
    .skipTo(toHTTP09);

  const skipCRLF = node('skip_lf_to_http09')
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
};
