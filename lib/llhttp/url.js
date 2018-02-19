'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p, isStrict = false) => {
  const errorInvalid = p.error(ERROR.INVALID_URL, 'Invalid characters in url');
  const errorStrictInvalid =
    p.error(ERROR.INVALID_URL, 'Invalid characters in url (strict)');

  const node = (name) => {
    const res = p.node('url_' + name);

    if (isStrict)
      res.match([ '\t', '\f' ], errorStrictInvalid);

    return res;
  };

  const URL_CHAR = isStrict ? constants.STRICT_URL_CHAR : constants.URL_CHAR;

  const start = node('start');
  const path = node('path');
  const schema = node('schema');
  const serverStart = node('server_start');
  const server = node('server');
  const queryStart = node('query_start');
  const query = node('query');
  const fragmentStart = node('fragment_start');
  const fragment = node('fragment');
  const serverWithAt = node('server_with_at');

  start
    .match([ '/', '*' ], path)
    .match(constants.ALPHA, schema)
    .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected start char in url'));

  schema
    .match(constants.ALPHA, schema)
    .match('://', serverStart)
    .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url schema'));

  serverStart
    .otherwise(server);

  server
    .match('/', path)
    .match('?', queryStart)
    .match('@', serverWithAt)
    .match(constants.USERINFO_CHARS, server)
    .match([ '[', ']' ], server)
    .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url server'));

  serverWithAt
    .match('@', p.error(ERROR.INVALID_URL, 'Double @ in url'))
    .otherwise(serverStart);

  path
    .match(URL_CHAR, path)
    .match('?', queryStart)
    .match('#', fragmentStart)
    .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url path'));

  queryStart.otherwise(query);

  query
    .match(URL_CHAR, query)
    // Allow extra '?' in query string
    .match('?', query)
    .match('#', fragmentStart)
    .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url query'));

  fragmentStart
    .match(URL_CHAR, fragment)
    .match('?', fragment)
    .match('#', fragmentStart)
    .otherwise(
      p.error(ERROR.INVALID_URL, 'Invalid char in url fragment start'));

  fragment
    .match(URL_CHAR, fragment)
    .match('?', fragment)
    .match('#', fragment)
    .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url fragment'));

  [ start, schema, serverStart ].forEach((node) => {
    node.match([ ' ', '\r', '\n' ], errorInvalid);
  });

  // Adaptors
  const toHttp = p.node('to_http');
  const toHttp09 = p.node('to_http_09');

  [
    server, serverWithAt, path, queryStart, query,
    fragmentStart, fragment
  ].forEach((node) => {
    node.match(' ', toHttp);
    node.match([ '\r\n', '\n' ], toHttp09);
  });

  return {
    start,
    serverStart,

    toHttp,
    toHttp09
  };
};
