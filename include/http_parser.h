#ifndef HTTP_PARSER_H_
#define HTTP_PARSER_H_

#include <stdint.h>

typedef struct http_parser_state_s http_parser_state_t;

struct http_parser_state_s {
  void* current;
  int32_t error;
  const char* reason;
  int32_t index;
  void* data;

  uint8_t method;
  uint16_t http_major;
  uint16_t http_minor;
  const char* _span_start0;
  void* _span_cb0;
};

void http_parser_init(http_parser_state_t* s);
int32_t http_parser_execute(http_parser_state_t* s, const char* p,
                            const char* endp);

#endif  /* HTTP_PARSER_H_ */
