#include "http_parser.h"

#include <stdio.h>

void http_parser__debug(http_parser_state_t* s, const char* p,
                        const char* endp, const char* msg) {
  fprintf(stderr, "debug: %s\n", msg);
}

int http_parser__start(http_parser_state_t* s, const char* p,
                       const char* endp) {
  fprintf(stderr, "http_parser__start\n");
  return 0;
}


int http_parser__on_url(http_parser_state_t* s, const char* p,
                        const char* endp) {
  fprintf(stderr, "http_parser__on_url, method: %d url: \"%.*s\"\n",
      s->method, (int) (endp - p), p);
  return 0;
}


int http_parser__is_connect(http_parser_state_t* s, const char* p,
                            const char* endp) {
  /* TODO(indutny): rewrite this insanity, possibly move to assembly */
  return s->method == 5;
}


int http_parser__on_http09(http_parser_state_t* s, const char* p,
                           const char* endp) {
  fprintf(stderr, "http_parser__on_http09\n");
  s->http_major = 0;
  s->http_minor = 9;
  return 0;
}


int http_parser__on_major(http_parser_state_t* s, const char* p,
                          const char* endp, int value) {
  s->http_major = value;
  fprintf(stderr, "http_parser__on_major=%d\n", s->http_major);
  return 0;
}


int http_parser__on_minor(http_parser_state_t* s, const char* p,
                          const char* endp, int value) {
  s->http_minor = value;
  fprintf(stderr, "http_parser__on_minor=%d\n", s->http_minor);
  return 0;
}
