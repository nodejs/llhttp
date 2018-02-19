#include "http_parser.h"

#include <stdio.h>

int http_parser__start(http_parser_state_t* s, const char* p,
                       const char* endp) {
  fprintf(stderr, "http_parser__start\n");
  return 0;
}


int http_parser__on_url_start(http_parser_state_t* s, const char* p,
                              const char* endp) {
  s->method = s->match;
  fprintf(stderr, "http_parser__on_url_start, method: %d\n", s->match);

  /* TODO(indutny): rewrite this insanity, possibly move to assembly */
  return s->method == 5;
}


int http_parser__on_url_end(http_parser_state_t* s, const char* p,
                            const char* endp) {
  fprintf(stderr, "http_parser__on_url_end\n");
  return 0;
}


int http_parser__on_http09(http_parser_state_t* s, const char* p,
                           const char* endp) {
  fprintf(stderr, "http_parser__on_http09\n");
  s->http_major = 0;
  s->http_minor = 9;
  return 0;
}
