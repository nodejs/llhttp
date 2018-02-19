'use strict';

const llhttp = require('../llhttp');
const constants = llhttp.constants;
const ERROR = constants.ERROR;

module.exports = (p, isStrict = false) => {
  const node = (name) => {
    const res = p.node(name)
      .match(' ', p.error(ERROR.INVALID_URL, 'Spaces in url'))
      .match('\r', p.error(ERROR.INVALID_URL, 'carrier return in url'))
      .match('\n', p.error(ERROR.INVALID_URL, 'newline in url'))

    if (isStrict) {
      res
        .match('\t', p.error(ERROR.INVALID_URL, 'tab in url'))
        .match('\f', p.error(ERROR.INVALID_URL, 'form feed in url'))
    }

    return res;
  };

  const start = node('url_start');
  const serverStart = node('url_server_start');

  start.skipTo(start);
  serverStart.skipTo(serverStart);

  return {
    start,
    serverStart
  };
};
