/*
 * Dispatch test for the runtime SSE4.2 selection in src/native/api.c.
 *
 * The markdown test suite links the generated parser compiled with -msse4.2
 * directly; it never compiles api.c, so the runtime dispatch added in
 * llhttp_execute() is not exercised there. This test links against the built
 * library (build/libllhttp.a), which contains api.c and -- on x86-64 -- both
 * the baseline parser and the -msse4.2 instantiation selected at runtime.
 *
 * It parses a request whose header values are long enough to drive the SSE4.2
 * span scanners (they need >= 16 bytes in a span), once in a single call and
 * once one byte at a time, and asserts the two runs agree and are correct.
 * Feeding one byte at a time keeps spans short, so the scalar fallback inside
 * the same dispatched parser is exercised too; the single-shot run takes the
 * vector path. Any divergence between them, or any parse error, fails.
 */

#include <stdio.h>
#include <string.h>

#include "llhttp.h"

static const char kRequest[] =
    "GET /de/catalog?q=widget&page=2 HTTP/1.1\r\n"
    "Host: shop.example.de\r\n"
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\r\n"
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,"
    "image/avif,image/webp,*/*;q=0.8\r\n"
    "Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7\r\n"
    "Cookie: session=0123456789abcdef0123456789abcdef; "
    "consent=granted-analytics-marketing-preferences; "
    "cart=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6\r\n"
    "\r\n";

/*
 * All counters are chunk-independent: byte lengths are accumulated across
 * however many data callbacks occur, and headers are counted via the
 * *_complete callbacks, which fire once per header regardless of how the input
 * was split. (The raw on_header_* data callbacks fire once per span piece, so
 * their invocation count legitimately differs between single-shot and
 * byte-wise feeding -- that is not a divergence.)
 */
typedef struct {
  int messages;
  int headers;
  size_t url_len;
  size_t header_field_len;
  size_t header_value_len;
  int errored;
} counters_t;

static int on_url(llhttp_t* p, const char* at, size_t len) {
  (void) at;
  ((counters_t*) p->data)->url_len += len;
  return 0;
}

static int on_header_field(llhttp_t* p, const char* at, size_t len) {
  (void) at;
  ((counters_t*) p->data)->header_field_len += len;
  return 0;
}

static int on_header_value(llhttp_t* p, const char* at, size_t len) {
  (void) at;
  ((counters_t*) p->data)->header_value_len += len;
  return 0;
}

static int on_header_value_complete(llhttp_t* p) {
  ((counters_t*) p->data)->headers++;
  return 0;
}

static int on_message_complete(llhttp_t* p) {
  ((counters_t*) p->data)->messages++;
  return 0;
}

static void init_settings(llhttp_settings_t* s) {
  llhttp_settings_init(s);
  s->on_url = on_url;
  s->on_header_field = on_header_field;
  s->on_header_value = on_header_value;
  s->on_header_value_complete = on_header_value_complete;
  s->on_message_complete = on_message_complete;
}

/* Returns 0 on HPE_OK, else the error code. */
static int run(counters_t* c, int chunked) {
  llhttp_settings_t settings;
  llhttp_t parser;
  size_t len = sizeof(kRequest) - 1;

  init_settings(&settings);
  llhttp_init(&parser, HTTP_REQUEST, &settings);
  memset(c, 0, sizeof(*c));
  parser.data = c;

  if (chunked) {
    for (size_t i = 0; i < len; i++) {
      llhttp_errno_t err = llhttp_execute(&parser, kRequest + i, 1);
      if (err != HPE_OK) {
        c->errored = 1;
        return (int) err;
      }
    }
    return (int) HPE_OK;
  }

  return (int) llhttp_execute(&parser, kRequest, len);
}

static int eq(const counters_t* a, const counters_t* b) {
  return a->messages == b->messages &&
         a->headers == b->headers &&
         a->url_len == b->url_len &&
         a->header_field_len == b->header_field_len &&
         a->header_value_len == b->header_value_len;
}

int main(void) {
  counters_t one_shot, byte_wise;
  int err_one = run(&one_shot, 0);
  int err_byte = run(&byte_wise, 1);

  if (err_one != (int) HPE_OK) {
    fprintf(stderr, "single-shot parse failed: %d\n", err_one);
    return 1;
  }
  if (err_byte != (int) HPE_OK) {
    fprintf(stderr, "byte-wise parse failed: %d\n", err_byte);
    return 1;
  }
  if (one_shot.messages != 1) {
    fprintf(stderr, "expected 1 message, got %d\n", one_shot.messages);
    return 1;
  }
  if (one_shot.headers != 5) {
    fprintf(stderr, "expected 5 headers, got %d\n", one_shot.headers);
    return 1;
  }
  if (!eq(&one_shot, &byte_wise)) {
    fprintf(stderr,
            "single-shot and byte-wise parses diverged: "
            "msgs %d/%d headers %d/%d url %zu/%zu field %zu/%zu value %zu/%zu\n",
            one_shot.messages, byte_wise.messages,
            one_shot.headers, byte_wise.headers,
            one_shot.url_len, byte_wise.url_len,
            one_shot.header_field_len, byte_wise.header_field_len,
            one_shot.header_value_len, byte_wise.header_value_len);
    return 1;
  }

  printf("dispatch test OK: 1 message, %d headers, url=%zu, values=%zu bytes\n",
         one_shot.headers, one_shot.url_len, one_shot.header_value_len);
  return 0;
}
