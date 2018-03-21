#include <stdio.h>
#ifndef HTTP_PARSER__TEST
# include "http_parser.h"
#else
# define http_parser_t llparse_t
#endif  /* */

/* TODO(indutny): this was public before, what should we do? */
int http_parser_message_needs_eof(const http_parser_t* parser);
int http_parser_should_keep_alive(const http_parser_t* parser);

int http_parser__before_headers_complete(http_parser_t* parser, const char* p,
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


/* Return values:
 * 0 - No body, `restart`, message_complete
 * 1 - CONNECT request, `restart`, message_complete, and pause
 * 2 - chunk_size_start
 * 3 - body_identity
 * 4 - body_identity_eof
 */
int http_parser__after_headers_complete(http_parser_t* parser, const char* p,
                                        const char* endp) {
  int hasBody;

  hasBody = parser->flags & F_CHUNKED || parser->content_length > 0;
  if (parser->upgrade && (parser->method == HTTP_CONNECT ||
                          (parser->flags & F_SKIPBODY) || !hasBody)) {
    /* Exit, the rest of the message is in a different protocol. */
    return 1;
  }

  if (parser->flags & F_SKIPBODY) {
    return 0;
  } else if (parser->flags & F_CHUNKED) {
    /* chunked encoding - ignore Content-Length header */
    return 2;
  } else {
    if (!(parser->flags & F_CONTENT_LENGTH)) {
      if (!http_parser_message_needs_eof(parser)) {
        /* Assume content-length 0 - read the next */
        return 0;
      } else {
        /* Read body until EOF */
        return 4;
      }
    } else if (parser->content_length == 0) {
      /* Content-Length header given but zero: Content-Length: 0\r\n */
      return 0;
    } else {
      /* Content-Length header given and non-zero */
      return 3;
    }
  }
}


int http_parser__after_message_complete(http_parser_t* parser, const char* p,
                                        const char* endp) {
  int should_keep_alive;

  should_keep_alive = http_parser_should_keep_alive(parser);
  parser->flags = 0;
  parser->finish = HTTP_FINISH_SAFE;

  return should_keep_alive;
}


int http_parser_message_needs_eof(const http_parser_t* parser) {
  if (parser->type == HTTP_REQUEST) {
    return 0;
  }

  /* See RFC 2616 section 4.4 */
  if (parser->status_code / 100 == 1 || /* 1xx e.g. Continue */
      parser->status_code == 204 ||     /* No Content */
      parser->status_code == 304 ||     /* Not Modified */
      (parser->flags & F_SKIPBODY)) {     /* response to a HEAD request */
    return 0;
  }

  if (parser->flags & (F_CHUNKED | F_CONTENT_LENGTH)) {
    return 0;
  }

  return 1;
}


int http_parser_should_keep_alive(const http_parser_t* parser) {
  if (parser->http_major > 0 && parser->http_minor > 0) {
    /* HTTP/1.1 */
    if (parser->flags & F_CONNECTION_CLOSE) {
      return 0;
    }
  } else {
    /* HTTP/1.0 or earlier */
    if (!(parser->flags & F_CONNECTION_KEEP_ALIVE)) {
      return 0;
    }
  }

  return !http_parser_message_needs_eof(parser);
}
