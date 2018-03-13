'use strict';

const constants = require('./constants');

class CHeaders {
  constructor() {
  }

  build() {
    let res = '';

    res += '#ifndef LLHTTP_PARSER_C_HEADERS_\n';
    res += '#define LLHTTP_PARSER_C_HEADERS_\n';
    res += '\n';

    res += this.buildEnum('http_errno', 'HPE', constants.ERROR);
    res += '\n';
    res += this.buildEnum('http_flags', 'F', constants.FLAGS,
      v => v.toString(16));
    res += '\n';
    res += this.buildEnum('http_parser_type', 'HTTP', constants.TYPE);
    res += '\n';
    res += this.buildEnum('http_method', 'HTTP', constants.METHODS);

    res += '\n';
    res += '#endif  /* LLHTTP_PARSER_C_HEADERS_ */\n';

    return res;
  }

  buildEnum(name, prefix, map, encode) {
    if (!encode)
      encode = v => v;

    let res = '';
    res += `enum ${name} {\n`;
    const keys = Object.keys(map);
    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;

      res += `  ${prefix}_${key} = ${encode(map[key])}`;
      if (!isLast)
        res += ',\n';
    });
    res += '\n};\n';

    return res;
  }
}
module.exports = CHeaders;
