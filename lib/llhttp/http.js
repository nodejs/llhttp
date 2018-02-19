'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p) => {
  const startReq = p.node('start_req');
  const startRes = p.node('start_res');
  const startReqOrRes = p.node('start_req_or_res');
  const reqSpacesBeforeUrl = p.node('req_spaces_before_url');

  const url = llhttp.url(p);

  const chooseServerOrUrl = p.invoke('http_parser__server_or_url', {
    0: url.serverStart,
    1: url.start
  }, p.error(ERROR.INTERNAL,
    'http_parser__server_or_url returned invalid value'));

  startReq
    .match('\r', startReq)
    .match('\n', startReq)
    .select(constants.METHODS, reqSpacesBeforeUrl)
    .otherwise(p.error(ERROR.INVALID_METHOD, 'Invalid method encountered'));

  startRes.skipTo(startRes);
  startReqOrRes.skipTo(startReqOrRes);

  reqSpacesBeforeUrl
    .match(' ', reqSpacesBeforeUrl)
    .otherwise(chooseServerOrUrl);

  return p.invoke('http_parser__start', {
    0: startReq,
    1: startRes,
    2: startReqOrRes
  }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
};
