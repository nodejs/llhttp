#ifndef INCLUDE_LLHTTP_API_H_
#define INCLUDE_LLHTTP_API_H_
#ifdef __cplusplus
extern "C" {
#endif

/* Get an http_errno value from an llhttp */
#define LLHTTP_ERRNO(p) ((enum llhttp_errno) (p)->error)

typedef llhttp__internal_t llhttp_t;
typedef struct llhttp_settings_s llhttp_settings_t;

typedef int (*llhttp_data_cb)(llhttp_t*, const char *at, size_t length);
typedef int (*llhttp_cb)(llhttp_t*);

struct llhttp_settings_s {
  llhttp_cb      on_message_begin;
  llhttp_data_cb on_url;
  llhttp_data_cb on_status;
  llhttp_data_cb on_header_field;
  llhttp_data_cb on_header_value;
  llhttp_cb      on_headers_complete;
  llhttp_data_cb on_body;
  llhttp_cb      on_message_complete;
  /* When on_chunk_header is called, the current chunk length is stored
   * in parser->content_length.
   */
  llhttp_cb      on_chunk_header;
  llhttp_cb      on_chunk_complete;
};

void llhttp_init(llhttp_t* parser, enum llhttp_type type,
                 const llhttp_settings_t* settings);
void llhttp_settings_init(llhttp_settings_t* settings);

enum llhttp_errno llhttp_execute(llhttp_t* parser, const char* data,
                                 size_t len);
enum llhttp_errno llhttp_finish(llhttp_t* parser);

int llhttp_message_needs_eof(const llhttp_t* parser);
int llhttp_should_keep_alive(const llhttp_t* parser);
void llhttp_resume(llhttp_t* parser);
void llhttp_resume_after_upgrade(llhttp_t* parser);

const char* llhttp_errno_name(enum llhttp_errno err);

#ifdef __cplusplus
}  /* extern "C" */
#endif
#endif  /* INCLUDE_LLHTTP_API_H_ */
