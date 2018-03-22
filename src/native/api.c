#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "http_parser.h"

#define CALLBACK_MAYBE(PARSER, NAME, ...)                                     \
  do {                                                                        \
    http_parser_settings_t* settings;                                         \
    settings = (PARSER)->settings;                                            \
    if (settings == NULL || settings->NAME == NULL) {                         \
      err = 0;                                                                \
      break;                                                                  \
    }                                                                         \
    err = settings->NAME(__VA_ARGS__);                                        \
  } while (0)

void http_parser_set_type(http_parser_t* parser, enum http_parser_type type) {
  parser->type = type;
}


void http_parser_set_settings(http_parser_t* parser,
                              const http_parser_settings_t* settings) {
  parser->settings = (void*) settings;
}


void http_parser_settings_init(http_parser_settings_t* settings) {
  memset(settings, 0, sizeof(*settings));
}


int http_parser_finish(http_parser_t* parser) {
  int err;

  /* We're in an error state. Don't bother doing anything. */
  if (parser->error != 0) {
    return 0;
  }

  switch (parser->finish) {
    case HTTP_FINISH_SAFE_WITH_CB:
      CALLBACK_MAYBE(parser, on_message_complete, parser);
      if (err != 0) return err;

    /* FALLTHROUGH */
    case HTTP_FINISH_SAFE:
      return 0;
    case HTTP_FINISH_UNSAFE:
      parser->reason = "Invalid EOF state";
      return HPE_INVALID_EOF_STATE;
    default:
      abort();
  }
}


void http_parser_resume(http_parser_t* parser) {
  if (parser->error != HPE_PAUSED) {
    return;
  }

  parser->error = 0;
}


void http_parser_resume_after_upgrade(http_parser_t* parser) {
  if (parser->error != HPE_PAUSED_UPGRADE) {
    return;
  }

  parser->error = 0;
}


const char* http_parser_errno_name(enum http_parser_errno err) {
#define HTTP_ERRNO_GEN(CODE, NAME, _) case HPE_##NAME: return "HPE_" #NAME;
  switch (err) {
    HTTP_ERRNO_MAP(HTTP_ERRNO_GEN)
    default: abort();
  }
#undef HTTP_ERRNO_GEN
}


/* Callbacks */


int http_parser__on_message_begin(http_parser_t* s, const char* p,
                                  const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_message_begin, s);
  return err;
}


int http_parser__on_url(http_parser_t* s, const char* p, const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_url, s, p, endp - p);
  return err;
}


int http_parser__on_status(http_parser_t* s, const char* p,
                           const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_status, s, p, endp - p);
  return err;
}


int http_parser__on_header_field(http_parser_t* s, const char* p,
                                 const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_header_field, s, p, endp - p);
  return err;
}


int http_parser__on_header_value(http_parser_t* s, const char* p,
                                 const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_header_value, s, p, endp - p);
  return err;
}


int http_parser__on_headers_complete(http_parser_t* s, const char* p,
                                     const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_headers_complete, s);
  return err;
}


int http_parser__on_message_complete(http_parser_t* s, const char* p,
                                     const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_message_complete, s);
  return err;
}


int http_parser__on_body(http_parser_t* s, const char* p, const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_body, s, p, endp - p);
  return err;
}


int http_parser__on_chunk_header(http_parser_t* s, const char* p,
                                 const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_chunk_header, s);
  return err;
}


int http_parser__on_chunk_complete(http_parser_t* s, const char* p,
                                   const char* endp) {
  int err;
  CALLBACK_MAYBE(s, on_chunk_complete, s);
  return err;
}


/* Private */


void http_parser__debug(http_parser_t* s, const char* p, const char* endp,
                        const char* msg) {
  if (p == endp) {
    fprintf(stderr, "p=%p type=%d flags=%02x next=null debug=%s\n", s, s->type,
            s->flags, msg);
  } else {
    fprintf(stderr, "p=%p type=%d flags=%02x next=%02x   debug=%s\n", s,
        s->type, s->flags, *p, msg);
  }
}
