#include "fixture.h"

int http_parser__on_url(llparse_state_t* s, const char* p, const char* endp) {
  return llparse__print_span("url", p, endp);
}


#ifdef HTTP_PARSER__TEST_HTTP

int http_parser__on_header_field(llparse_state_t* s, const char* p,
                                 const char* endp) {
  return llparse__print_span("header_field", p, endp);
}


int http_parser__on_header_value(llparse_state_t* s, const char* p,
                                 const char* endp) {
  return llparse__print_span("header_value", p, endp);
}


int http_parser__on_finished_header(llparse_state_t* s, const char* p,
                                    const char* endp) {
  llparse__print(p, endp, "finished header");
  return 0;
}


int http_parser__on_headers_complete(llparse_state_t* s, const char* p,
                                     const char* endp) {
  llparse__print(p, endp, "headers complete");
  return 0;
}

#endif  /* HTTP_PARSER__TEST_HTTP */
