import { readFile } from "fs/promises";
import * as constants from "../build/wasm/constants.js";

function http(input) {
  return input
    .trim()
    .replaceAll(/^\s+/gm, "")
    .replaceAll("\n", "")
    .replaceAll("\\r", "\r")
    .replaceAll("\\n", "\n");
}

function formatNumber(num, precision) {
  return num
    .toLocaleString("en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      useGrouping: "always",
    })
    .replaceAll(",", "_");
}

/* eslint-disable @stylistic/max-len */
const samples = {
  seanmonstar_httparse: http(`
    GET /wp-content/uploads/2010/03/hello-kitty-darth-vader-pink.jpg HTTP/1.1\\r\\n
    Host: www.kittyhell.com\\r\\n
    User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; ja-JP-mac; rv:1.9.2.3) Gecko/20100401 Firefox/3.6.3 Pathtraq/0.9\\r\\n
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\\r\\n
    Accept-Language: ja,en-us;q=0.7,en;q=0.3\\r\\n
    Accept-Encoding: gzip,deflate\\r\\n
    Accept-Charset: Shift_JIS,utf-8;q=0.7,*;q=0.7\\r\\n
    Keep-Alive: 115\\r\\n
    Connection: keep-alive\\r\\n
    Cookie: wp_ozh_wsa_visits=2; wp_ozh_wsa_visit_lasttime=xxxxxxxxxx; __utma=xxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.xxxxxxxxxx.x; __utmz=xxxxxxxxx.xxxxxxxxxx.x.x.utmccn=(referral)|utmcsr=reader.livedoor.com|utmcct=/reader/|utmcmd=referral\\r\\n\\r\\n
  `),
  nodejs_http_parser: http(`
    POST /joyent/http-parser HTTP/1.1\\r\\n
    Host: github.com\\r\\n
    DNT: 1\\r\\n
    Accept-Encoding: gzip, deflate, sdch\\r\\n
    Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4\\r\\n
    User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1)
    AppleWebKit/537.36 (KHTML, like Gecko)
    Chrome/39.0.2171.65 Safari/537.36\\r\\n
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,
    image/webp,*/*;q=0.8\\r\\n
    Referer: https://github.com/joyent/http-parser\\r\\n
    Connection: keep-alive\\r\\n
    Transfer-Encoding: chunked\\r\\n
    Cache-Control: max-age=0\\r\\n\\r\\nb\\r\\nhello world\\r\\n0\\r\\n\\r\\n
  `)  
};
/* eslint-enable @stylistic/max-len */

async function main () {
  const mod = await WebAssembly.compile(
    await readFile(new URL("../build/wasm/llhttp.wasm", import.meta.url))
  );

  const { exports: llhttp } = await WebAssembly.instantiate(mod, {
    env: {
      wasm_on_url() {
        return 0;
      },
      wasm_on_status() {
        return 0;
      },
      wasm_on_message_begin() {
        return 0;
      },
      wasm_on_header_field() {
        return 0;
      },
      wasm_on_header_value() {
        return 0;
      },
      wasm_on_headers_complete() {
        return 0;
      },
      wasm_on_body() {
        return 0;
      },
      wasm_on_message_complete() {
        return 0;
      },
    },
  });

  for (const [ name, payload ] of Object.entries(samples)) {
    const len = payload.length;
    const iterations = 2 ** 33 / len;
    const total = iterations * len;

    const parser = llhttp.llhttp_alloc(constants.TYPE.BOTH);
    const ptr = llhttp.malloc(len);
    new Uint8Array(llhttp.memory.buffer, ptr, len).set(Buffer.from(payload));

    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      llhttp.llhttp_execute(parser, ptr, len);
    }

    llhttp.free(ptr);
    llhttp.llhttp_free(ptr);

    const time = Number(process.hrtime.bigint() - start) / 1e9;
    const bw = total / time;

    const label = name.padStart(21, " ");
    const samples = formatNumber(iterations, 0).padStart(12);
    const size = formatNumber(total / (1024 * 1024), 2).padStart(8);
    const speed = formatNumber(bw / (1024 * 1024), 2).padStart(10);
    const throughtput = formatNumber(iterations / time, 2).padStart(10);
    const duration = formatNumber(time, 2).padStart(6);

    console.log(
      `${label} | ${samples} samples | ${size} MB | ${speed} MB/s | ${throughtput} ops/sec | ${duration} s`
    );
  }
}

main()