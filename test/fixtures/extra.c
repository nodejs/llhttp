#include "fixture.h"

int http_parser__on_url(llparse_state_t* s, const char* p, const char* endp) {
  return llparse__print_span("url", p, endp);
}
