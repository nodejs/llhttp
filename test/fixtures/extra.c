#include <stdlib.h>

#include "fixture.h"

int llhttp__on_url(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;

  return llparse__print_span("url", p, endp);
}


int llhttp__on_url_schema(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("url.schema", p, endp);
}


int llhttp__on_url_host(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("url.host", p, endp);
}


int llhttp__on_url_path(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("url.path", p, endp);
}


int llhttp__on_url_query(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("url.query", p, endp);
}


int llhttp__on_url_fragment(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("url.fragment", p, endp);
}


#ifdef LLHTTP__TEST_HTTP

void llhttp__test_init_request(llparse_t* s) {
  s->type = HTTP_REQUEST;
}


void llhttp__test_init_response(llparse_t* s) {
  s->type = HTTP_RESPONSE;
}


void llhttp__test_init_request_lenient(llparse_t* s) {
  llhttp__test_init_request(s);
  s->flags |= F_LENIENT;
}


void llhttp__test_finish(llparse_t* s) {
  llparse__print(NULL, NULL, "finish=%d", s->finish);
}


int llhttp__on_status(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("status", p, endp);
}


int llhttp__on_header_field(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("header_field", p, endp);
}


int llhttp__on_header_value(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("header_value", p, endp);
}


int llhttp__on_headers_complete(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;

  if (s->type == HTTP_REQUEST) {
    llparse__print(p, endp,
        "headers complete method=%d v=%d/%d flags=%x content_length=%llu",
        s->method, s->http_major, s->http_minor, s->flags, s->content_length);
  } else if (s->type == HTTP_RESPONSE) {
    llparse__print(p, endp,
        "headers complete status=%d v=%d/%d flags=%x content_length=%llu",
        s->status_code, s->http_major, s->http_minor, s->flags,
        s->content_length);
  } else {
    llparse__print(p, endp, "invalid headers complete");
  }
  return 0;
}


int llhttp__on_message_begin(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp, "message begin");
  return 0;
}


int llhttp__on_message_complete(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp, "message complete");
  return 0;
}


int llhttp__on_body(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  return llparse__print_span("body", p, endp);
}


int llhttp__on_chunk_header(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp, "chunk header len=%d", (int) s->content_length);
  return 0;
}


int llhttp__on_chunk_complete(llparse_t* s, const char* p, const char* endp) {
  if (llparse__in_bench)
    return 0;
  llparse__print(p, endp, "chunk complete");
  return 0;
}

#endif  /* LLHTTP__TEST_HTTP */
