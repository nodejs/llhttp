import constants from './constants';
import type { IntDict } from './constants';

type Encoding = 'none' | 'hex';

export class CHeaders {
  public build(): string {
    let res = '';

    res += '#ifndef LLLLHTTP_C_HEADERS_\n';
    res += '#define LLLLHTTP_C_HEADERS_\n';

    res += '#ifdef __cplusplus\n';
    res += 'extern "C" {\n';
    res += '#endif\n';

    res += '\n';

    res += this.buildEnum('llhttp_errno', 'HPE', constants.ERROR);
    res += '\n';
    res += this.buildEnum('llhttp_flags', 'F', constants.FLAGS,
      'hex');
    res += '\n';
    res += this.buildEnum('llhttp_lenient_flags', 'LENIENT',
      constants.LENIENT_FLAGS, 'hex');
    res += '\n';
    res += this.buildEnum('llhttp_type', 'HTTP', constants.TYPE);
    res += '\n';
    res += this.buildEnum('llhttp_finish', 'HTTP_FINISH', constants.FINISH);
    res += '\n';
    res += this.buildEnum('llhttp_method', 'HTTP', constants.METHODS);
    res += '\n';
    res += this.buildEnum('llhttp_status', 'HTTP_STATUS', constants.STATUSES);

    res += '\n';

    res += this.buildMap('HTTP_ERRNO', constants.ERROR);
    res += '\n';
    res += this.buildMap('HTTP_METHOD', constants.METHODS_HTTP1);
    res += '\n';
    res += this.buildMap('RTSP_METHOD', constants.METHODS_RTSP);
    res += '\n';
    res += this.buildMap('HTTP_ALL_METHOD', constants.METHODS);
    res += '\n';
    res += this.buildMap('HTTP_STATUS', constants.STATUSES);

    res += '\n';

    res += '#ifdef __cplusplus\n';
    res += '}  /* extern "C" */\n';
    res += '#endif\n';
    res += '#endif  /* LLLLHTTP_C_HEADERS_ */\n';

    return res;
  }

  private buildEnum(name: Lowercase<string>, prefix: string, map: IntDict,
                    encoding: Encoding = 'none'): string {
    let res = '';

    for (const [ key, value ] of Object.entries(map).sort((a,b) => a[1] - b[1])) {
      if (res !== "") {
        res += ',\n';
      }

      res += `  ${prefix}_${key.replace(/-/g, '')} = `

      if (encoding === 'hex') {
        res += `0x${value.toString(16)}`;
      } else {
        res += value;
      }
    }

    return `enum ${name} {\n${res}\n};\ntypedef enum ${name} ${name}_t;\n`;
  }

  private buildMap(name: Uppercase<string>, map: IntDict): string {
    let res = '';

    res += `#define ${name}_MAP(XX) \\\n`;
    for (const [ key, value ] of Object.entries(map).sort((a,b) => a[1] - b[1])) {
      res += `  XX(${value}, ${key.replace(/-/g, '')}, ${key}) \\\n`;
    }
    res += '\n';

    return res;
  }
}
