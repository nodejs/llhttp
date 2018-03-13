#include "fixture.h"

int http_parser__on_url(llparse_state_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;

  return llparse__print_span("url", p, endp);
}


#ifdef HTTP_PARSER__TEST_HTTP

int http_parser__on_header_field(llparse_state_t* s, const char* p,
                                 const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("header_field", p, endp);
}


int http_parser__on_header_value(llparse_state_t* s, const char* p,
                                 const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("header_value", p, endp);
}


int http_parser__on_headers_complete(llparse_state_t* s, const char* p,
                                     const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp,
      "headers complete method=%d v=%d/%d flags=%x content_length=%llu",
      s->method, s->http_major, s->http_minor, s->flags, s->content_length);
  return 0;
}


int http_parser__on_message_complete(llparse_state_t* s, const char* p,
                                     const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp, "message complete");
  return 0;
}
#endif  /* HTTP_PARSER__TEST_HTTP */
