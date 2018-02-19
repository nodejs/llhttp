'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p) => {
  const startReq = p.node('start_req');
  const startRes = p.node('start_res');
  const startReqOrRes = p.node('start_req_or_res');
  const reqSpacesBeforeUrl = p.node('req_spaces_before_url');
  const httpStart = p.node('http_start');
  const httpMajor = p.node('http_major');
  const httpDot = p.node('http_dot');
  const httpMinor = p.node('http_minor');
  const headerFieldStart = p.node('header_field_start');

  const url = llhttp.url(p);

  const onURLStart = p.invoke('http_parser__on_url_start', {
    // Normal METHODS
    0: url.start,

    // CONNECT
    1: url.serverStart
  }, p.error(ERROR.INTERNAL,
    'http_parser__on_url_start returned invalid value'));

  const onURLEnd = p.invoke('http_parser__on_url_end', {
    0: httpStart
  }, p.error(ERROR.INTERNAL, 'http_parser__on_url_end returned invalid value'));

  const onHTTP09 = p.invoke('http_parser__on_http09', {
    0: headerFieldStart
  }, p.error(ERROR.INTERNAL, 'http_parser__on_http09 returned invalid value'));

  const onMajor = p.invoke('http_parser__on_major', {
    0: httpDot
  }, p.error(ERROR.INTERNAL, 'http_parser__on_major returned invalid value'));

  const onMinor = p.invoke('http_parser__on_minor', {
    0: headerFieldStart
  }, p.error(ERROR.INTERNAL, 'http_parser__on_minor returned invalid value'));

  startReq
    .match('\r', startReq)
    .match('\n', startReq)
    .select(constants.METHODS, reqSpacesBeforeUrl)
    .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

  startRes.skipTo(startRes);
  startReqOrRes.skipTo(startReqOrRes);

  reqSpacesBeforeUrl
    .match(' ', reqSpacesBeforeUrl)
    .otherwise(onURLStart);

  url.toHttp
    .otherwise(onURLEnd);

  url.toHttp09
    .otherwise(onHTTP09);

  httpStart
    // TODO(indutny): non-strict mode didn't care about the rest
    .match('HTTP/', httpMajor)
    .match(' ', httpStart)
    .otherwise(p.error(ERROR.INVALID_CONSTANT, 'Expected HTTP/'));

  httpMajor
    .select(constants.MAJOR, onMajor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid major version'));

  httpDot
    .match('.', httpMinor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected dot'));

  httpMinor
    .select(constants.MINOR, onMinor)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Invalid minor version'));

  headerFieldStart.skipTo(headerFieldStart);

  return p.invoke('http_parser__start', {
    0: startReq,
    1: startRes,
    2: startReqOrRes
  }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
};
