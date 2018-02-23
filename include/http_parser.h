#ifndef LLPARSE_HEADER_HTTP_PARSER
#define LLPARSE_HEADER_HTTP_PARSER

#include <stdint.h>

typedef struct http_parser_state_s http_parser_state_t;
struct http_parser_state_s {
  void* _current;
  uint32_t _index;
  uint32_t error;
  void* reason;
  void* data;
  uint8_t method;
  uint8_t http_major;
  uint8_t http_minor;
  void* _span_start0;
  void* _span_cb0;
};

void http_parser_init(http_parser_state_t* s);
int http_parser_execute(http_parser_state_t* s, const char* p, const char* endp);

#endif  /* LLPARSE_HEADER_HTTP_PARSER */
