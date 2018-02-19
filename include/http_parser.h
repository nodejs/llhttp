#include <stdint.h>

typedef struct http_parser_state_s http_parser_state_t;

struct http_parser_state_s {
  void* current;
  int32_t error;
  const char* reason;
  int32_t index;
  int32_t match;

  unsigned short http_major;
  unsigned short http_minor;
  unsigned int method : 8;
};

void http_parser_init(http_parser_state_t* s);
int32_t http_parser_execute(http_parser_state_t* s, const char* p,
                            const char* endp);
