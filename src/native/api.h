#ifndef INCLUDE_HTTP_PARSER_API_H_
#define INCLUDE_HTTP_PARSER_API_H_
#ifdef __cplusplus
extern "C" {
#endif

typedef int (*http_parser_data_cb)(http_parser_t*, const char *at,
                                   size_t length);
typedef int (*http_parser_cb)(http_parser_t*);

typedef struct http_parser_settings_s http_parser_settings_t;

struct http_parser_settings_s {
  http_parser_cb      on_message_begin;
  http_parser_data_cb on_url;
  http_parser_data_cb on_status;
  http_parser_data_cb on_header_field;
  http_parser_data_cb on_header_value;
  http_parser_cb      on_headers_complete;
  http_parser_data_cb on_body;
  http_parser_cb      on_message_complete;
  /* When on_chunk_header is called, the current chunk length is stored
   * in parser->content_length.
   */
  http_parser_cb      on_chunk_header;
  http_parser_cb      on_chunk_complete;
};

void http_parser_set_type(http_parser_t* parser, enum http_parser_type type);
void http_parser_set_settings(http_parser_t* parser,
                              const http_parser_settings_t* settings);
void http_parser_settings_init(http_parser_settings_t* settings);

int http_parser_message_needs_eof(const http_parser_t* parser);
int http_parser_should_keep_alive(const http_parser_t* parser);
int http_parser_finish(http_parser_t* parser);
void http_parser_resume(http_parser_t* parser);
void http_parser_resume_after_upgrade(http_parser_t* parser);

const char* http_parser_errno_name(enum http_parser_errno err);

#ifdef __cplusplus
}  /* extern "C" */
#endif
#endif  /* INCLUDE_HTTP_PARSER_API_H_ */
