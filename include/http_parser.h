typedef struct http_parser_state_s http_parser_state_t;

struct http_parser_state_s {
  void* current;
  int error;
  const char* reason;
  int index;
  int match;
};

void http_parser_init(http_parser_state_t* s);
int http_parser_execute(http_parser_state_t* s, const char* p,
                        const char* endp);
