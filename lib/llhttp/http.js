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
  const headerFieldStart = p.node('header_field_start');

  const url = llhttp.url(p);

  const urlStart = p.invoke('http_parser__on_url_start', {
    // Normal METHODS
    0: url.start,

    // CONNECT
    1: url.serverStart
  }, p.error(ERROR.INTERNAL,
    'http_parser__on_url_start returned invalid value'));

  const urlEnd = p.invoke('http_parser__on_url_end', {
    0: httpStart
  }, p.error(ERROR.INTERNAL, 'http_parser__on_url_end returned invalid value'));

  const http09 = p.invoke('http_parser__on_http09', {
    0: headerFieldStart
  }, p.error(ERROR.INTERNAL, 'http_parser__on_http09 returned invalid value'));

  startReq
    .match('\r', startReq)
    .match('\n', startReq)
    .select(constants.METHODS, reqSpacesBeforeUrl)
    .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

  startRes.skipTo(startRes);
  startReqOrRes.skipTo(startReqOrRes);

  reqSpacesBeforeUrl
    .match(' ', reqSpacesBeforeUrl)
    .otherwise(urlStart);

  url.toHttp
    .otherwise(urlEnd);

  url.toHttp09
    .otherwise(http09);

  httpStart.skipTo(httpStart);
  headerFieldStart.skipTo(headerFieldStart);

  return p.invoke('http_parser__start', {
    0: startReq,
    1: startRes,
    2: startReqOrRes
  }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
};
