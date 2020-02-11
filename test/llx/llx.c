#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#include "llhttp.h"

const char* slurp(const char* file, size_t* sz) {
  char buf[10000];
  size_t bufsz;
  static char msg[sizeof(buf) * 2];

  int fd = open(file, O_RDONLY);
  if (fd < 0) {
    perror("open");
    exit(1);
  }

  bufsz = read(fd, buf, sizeof(buf));
  if (bufsz < 0) {
    perror("read");
    exit(1);
  }

  size_t rd = 0;
  size_t wr = 0;
  while(rd < bufsz) {
    if(buf[rd] == '\n') {
      msg[wr++] = '\r';
    }
    msg[wr++] = buf[rd++];
  }
  msg[wr] = '\0';

  *sz = wr;

  return msg;
}

int data_cb(const char* lable, llhttp_t* ll, const char *at, size_t sz) {
  printf("* on_%s: at %zd:<\n%.*s\n>\n", lable, sz, (int)sz, at);
  return 0;
}

int on_url(llhttp_t* ll, const char *at, size_t sz) { return data_cb("url", ll, at, sz); }
int on_status(llhttp_t* ll, const char *at, size_t sz) { return data_cb("status", ll, at, sz); }
int on_header_field(llhttp_t* ll, const char *at, size_t sz) { return data_cb("header_field", ll, at, sz); }
int on_header_value(llhttp_t* ll, const char *at, size_t sz) { return data_cb("header_value", ll, at, sz); }
int on_body(llhttp_t* ll, const char *at, size_t sz) { return data_cb("body", ll, at, sz); }

int cb(const char* lable, llhttp_t* ll) {
  printf("* on_%s\n", lable);
  return 0;
}

int on_message_begin(llhttp_t* ll) { return cb("message_begin", ll); }
int on_headers_complete(llhttp_t* ll) { return cb("headers_complete", ll); }
int on_message_complete(llhttp_t* ll) { return cb("message_complete", ll); }
int on_chunk_header(llhttp_t* ll) { return cb("chunk_header", ll); }
int on_chunk_complete(llhttp_t* ll) { return cb("chunk_complete", ll); }

int main(int argc, char* argv[]) {
  if (!argv[1]) {
    printf("Usage: %s <HTTP>\n", argv[0]);
    return 0;
  }

  size_t msgsz;
  const char* msg = slurp(argv[1], &msgsz);

  llhttp_t parser;
  llhttp_settings_t settings;

  llhttp_settings_init(&settings);
  settings.on_message_begin = on_message_begin;
  settings.on_url = on_url;
  settings.on_status = on_status;
  settings.on_header_field = on_header_field;
  settings.on_header_value = on_header_value;
  settings.on_headers_complete = on_headers_complete;
  settings.on_body = on_body;
  settings.on_message_complete = on_message_complete;
  llhttp_init(&parser, HTTP_BOTH, &settings);

  llhttp_set_lenient(&parser, 0);

  enum llhttp_errno err;

  printf("* message: %zd:<\n%.*s\n>\n", msgsz, (int)msgsz, msg);

  err = llhttp_execute(&parser, msg, msgsz);

  printf("execute() => %s: %s\n",
      llhttp_errno_name(err),
      llhttp_get_error_reason(&parser)
      );

  const char* epos = llhttp_get_error_pos(&parser);

  if (epos > msg && epos <= (msg + msgsz)) {
    size_t at = epos - msg;
    printf("- error at: %zd/%zd <%.20s>...\n",
        at, msgsz, epos);
  }

  if (err != HPE_OK)
    return err != HPE_OK;

  if (llhttp_message_needs_eof(&parser)) {
    err = llhttp_finish(&parser);

    printf("finish() => %s: %s\n",
        llhttp_errno_name(err),
        llhttp_get_error_reason(&parser)
        );
  }

  return err != HPE_OK;
}
