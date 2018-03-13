#ifndef HTTP_PARSER__TEST
# include "http_parser.h"
#else
# define http_parser_t llparse_state_t
#endif  /* */

int http_parser__prepare_headers_complete(http_parser_t* parser, const char* p,
                                          const char* endp) {
  /* Set this here so that on_headers_complete() callbacks can see it */
  if ((parser->flags & F_UPGRADE) &&
      (parser->flags & F_CONNECTION_UPGRADE)) {
    /* For responses, "Upgrade: foo" and "Connection: upgrade" are
     * mandatory only when it is a 101 Switching Protocols response,
     * otherwise it is purely informational, to announce support.
     */
    parser->upgrade =
        (parser->type == HTTP_REQUEST || parser->status_code == 101);
  } else {
    parser->upgrade = (parser->method == HTTP_CONNECT);
  }
  return 0;
}
