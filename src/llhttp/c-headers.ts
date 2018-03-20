import * as constants from './constants';
import { enumToMap, IEnumMap } from './utils';

type Encoding = 'none' | 'hex';

export class CHeaders {
  public build(): string {
    let res = '';

    res += '#ifndef LLHTTP_PARSER_C_HEADERS_\n';
    res += '#define LLHTTP_PARSER_C_HEADERS_\n';

    res += '#ifdef __cplusplus\n';
    res += 'extern "C" {\n';
    res += '#endif\n';

    res += '\n';

    res += this.buildEnum('http_errno', 'HPE', enumToMap(constants.ERROR));
    res += '\n';
    res += this.buildEnum('http_flags', 'F', enumToMap(constants.FLAGS), 'hex');
    res += '\n';
    res += this.buildEnum('http_parser_type', 'HTTP',
      enumToMap(constants.TYPE));
    res += '\n';
    res += this.buildEnum('http_method', 'HTTP', enumToMap(constants.METHODS));

    res += '\n';

    res += '#ifdef __cplusplus\n';
    res += '}  /* extern "C" */\n';
    res += '#endif\n';
    res += '#endif  /* LLHTTP_PARSER_C_HEADERS_ */\n';

    return res;
  }

  private buildEnum(name: string, prefix: string, map: IEnumMap,
                    encoding: Encoding = 'none'): string {
    let res = '';

    res += `enum ${name} {\n`;
    const keys = Object.keys(map);
    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;

      let value: number | string = map[key];

      if (encoding === 'hex') {
        value = `0x${value.toString(16)}`;
      }

      res += `  ${prefix}_${key} = ${value}`;
      if (!isLast) {
        res += ',\n';
      }
    });
    res += '\n};\n';

    return res;
  }
}
