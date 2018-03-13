'use strict';

const constants = require('./constants');

class CHeaders {
  constructor() {
  }

  build() {
    let res = '';

    res += 'enum http_errno {\n';
    const errorKeys = Object.keys(constants.ERROR);
    res += '  HPE_OK = 0';
    errorKeys.forEach((key) => {
      res += ',\n';
      res += `  HPE_${key} = ${constants.ERROR[key]}`;
    });
    res += '\n};\n';

    return res;
  }
}
module.exports = CHeaders;
