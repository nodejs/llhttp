'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p, isStrict = false) => {
  const TOKEN = isStrict ? constants.STRICT_TOKEN : constants.TOKEN;

  p.property('i8', 'method');
  p.property('i8', 'http_major');
  p.property('i8', 'http_minor');

  const headerFieldSpan = p.span(p.code.span('http_parser__on_header_field'));
  const headerValueSpan = p.span(p.code.span('http_parser__on_header_value'));

  const startReq = p.node('start_req');
  const startRes = p.node('start_res');
  const startReqOrRes = p.node('start_req_or_res');
  const reqSpacesBeforeUrl = p.node('req_spaces_before_url');
  const httpStart = p.node('http_start');
  const httpMajor = p.node('http_major');
  const httpDot = p.node('http_dot');
  const httpMinor = p.node('http_minor');
  const httpEnd = p.node('http_end');
  const headerFieldStart = p.node('header_field_start');
  const headerField = p.node('header_field');
  const headerFieldColon = p.node('header_field_colon');
  const headerFieldGeneral = p.node('header_field_general');
  const headerValueDiscardWS = p.node('header_value_discard_ws');
  const headerValueDiscardLWS = p.node('header_value_discard_lws');
  const headerValueStart = p.node('header_value_start');
  const headersAlmostDone = p.node('headers_almost_done');

  const url = llhttp.url(p, isStrict);

  const isConnect = p.invoke(
    p.code.isEqual('method', constants.METHOD.CONNECT),
    {
      // CONNECT
      0: url.entry.connect,

      // Normal METHODS
      1: url.entry.normal
    },
    p.error(ERROR.INTERNAL,
      '`http_parser__is_connect` returned invalid value')
  );

  const onSpecificHeader =
    p.invoke(p.code.value('http_parser__on_specific_header'));

  const storeMethod = p.invoke(p.code.store('method'), reqSpacesBeforeUrl);
  const storeMajor = p.invoke(p.code.store('http_major'), httpDot);
  const storeMinor = p.invoke(p.code.store('http_minor'), httpEnd);
  const onHTTP09 = p.invoke(p.code.update('http_major', 0))
    .otherwise(p.invoke(p.code.update('http_minor', 9), headerFieldStart));

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

  httpEnd
    .match([ '\r\n', '\n' ], headerFieldStart)
    .otherwise(p.error(ERROR.INVALID_VERSION, 'Expected CRLF after version'));

  headerFieldStart
    .match('\r', headersAlmostDone)
    .peek('\n', headersAlmostDone)
    .otherwise(headerFieldSpan.start(headerField));

  headerField
    .transform(p.transform.toLowerUnsafe())
    .select({
      'proxy-connection': 0,
      'connection': 1,
      'content-length': 2,
      'transfer-encoding': 3,
      'upgrade': 4
    }, onSpecificHeader.otherwise(headerFieldColon))
    .otherwise(headerFieldGeneral);

  headerFieldColon
    .peek(':', headerFieldSpan.end().skipTo(headerValueDiscardWS))
    .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));

  headerFieldGeneral
    .match(TOKEN, headerFieldGeneral)
    .peek(':', headerFieldSpan.end().skipTo(headerValueDiscardWS))
    .otherwise(p.error(ERROR.INVALID_HEADER_TOKEN, 'Invalid header token'));

  headerValueDiscardWS
    .match([ ' ', '\t' ], headerValueDiscardWS)
    // TODO(indutny): strict check
    .match('\r\n', headerValueDiscardLWS)
    .otherwise(headerValueSpan.start(headerValueStart));

  // TODO(indutny): implement me
  headerValueDiscardLWS
    .skipTo(headerValueDiscardLWS);

  // TODO(indutny): implement me
  headerValueStart
    .skipTo(headerValueStart);

  // TODO(indutny): implement me
  headersAlmostDone
    .skipTo(headersAlmostDone);

  return p.invoke(p.code.match('http_parser__start'), {
    0: startReq,
    1: startRes,
    2: startReqOrRes
  }, p.error(ERROR.INTERNAL, 'http_parser__start returned invalid value'));
};
