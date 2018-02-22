'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p, isStrict = false) => {
  p.property(ir => ir.i(8), 'method');
  p.property(ir => ir.i(8), 'http_major');
  p.property(ir => ir.i(8), 'http_minor');

  const startReq = p.node('start_req');
  const startRes = p.node('start_res');
  const startReqOrRes = p.node('start_req_or_res');
  const reqSpacesBeforeUrl = p.node('req_spaces_before_url');
  const httpStart = p.node('http_start');
  const httpMajor = p.node('http_major');
  const httpDot = p.node('http_dot');
  const httpMinor = p.node('http_minor');
  const headerFieldStart = p.node('header_field_start');

  const url = llhttp.url(p, isStrict);

  const isConnect = p.invoke(p.code.match('http_parser__is_connect'), {
    // CONNECT
    0: url.entry.connect,

    // Normal METHODS
    1: url.entry.normal
  }, p.error(ERROR.INTERNAL,
    '`http_parser__is_connect` returned invalid value'));

  const storeMethod = p.invoke(p.code.store('method'), reqSpacesBeforeUrl);
  const storeMajor = p.invoke(p.code.store('http_major'), httpDot);
  const storeMinor = p.invoke(p.code.store('http_minor'), headerFieldStart);
  const onHTTP09 = p.invoke(p.code.match('http_parser__on_http09'),
    headerFieldStart);

  startReq
    .match('\r', startReq)
    .match('\n', startReq)
    .select(constants.METHODS, storeMethod)
    .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

  startRes.skipTo(startRes);
  startReqOrRes.skipTo(startReqOrRes);

  reqSpacesBeforeUrl
    .match(' ', reqSpacesBeforeUrl)
    .otherwise(isConnect);

  url.exit.toHTTP
    .otherwise(httpStart);

  url.exit.toHTTP09
    .otherwise(onHTTP09);

  httpStart
    // TODO(indutny): non-strict mode didn't care about the rest
    .match('HTTP/', httpMajor)
    .match(' ', httpStart)
    .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

  httpMajor
    .select(constants.MAJOR, storeMajor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

  httpDot
    .match('.', httpMinor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

  httpMinor
    .select(constants.MINOR, storeMinor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

  headerFieldStart
    .skipTo(headerFieldStart);

  return p.invoke(p.code.match('http_parser__start'), {
    0: startReq,
    1: startRes,
    2: startReqOrRes
  }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
};
