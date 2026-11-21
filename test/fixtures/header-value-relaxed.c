#include <assert.h>
#include <stdio.h>
#include <string.h>

#include "llhttp.h"

static void check(llhttp_type_t type, int mode, const char* input, size_t len,
                  size_t split, size_t value_offset, unsigned char byte) {
  llhttp_t parser;
  llhttp_settings_t settings;
  llhttp_errno_t err;
  int invalid;

  llhttp_settings_init(&settings);
  llhttp_init(&parser, type, &settings);
  if (mode & 1)
    llhttp_set_lenient_header_value_relaxed(&parser, 1);
  if (mode & 2)
    llhttp_set_lenient_headers(&parser, 1);

  invalid = !(mode & 2) &&
      (byte == 0 || (!(mode & 1) &&
                    ((byte < 0x20 && byte != '\t') || byte == 0x7f)));

  err = llhttp_execute(&parser, input, split);
  if (err == HPE_OK)
    err = llhttp_execute(&parser, input + split, len - split);

  if (invalid) {
    assert(err == HPE_INVALID_HEADER_TOKEN);
    assert(llhttp_get_error_pos(&parser) == input + value_offset);
  } else {
    assert(err == HPE_OK);
    assert(llhttp_finish(&parser) == HPE_OK);
  }
}

int main(void) {
  static const struct {
    llhttp_type_t type;
    const char* prefix;
    const char* suffix;
  } messages[] = {
    { HTTP_REQUEST, "GET / HTTP/1.1\r\nX: ", "\r\n\r\n" },
    { HTTP_REQUEST, "GET / HTTP/1.1\r\nHost: ", "\r\n\r\n" },
    { HTTP_RESPONSE, "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nX: ",
      "\r\n\r\n" },
    { HTTP_REQUEST,
      "POST / HTTP/1.1\r\nTransfer-Encoding: chunked\r\n\r\n0\r\nX: ",
      "\r\n\r\n" },
    { HTTP_RESPONSE,
      "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n0\r\nX: ",
      "\r\n\r\n" },
  };
  static const size_t lengths[] = { 0, 1, 15, 16, 17, 200 };
  char input[512];
  size_t message;
  size_t length;
  size_t prefix_len;
  size_t value_offset;
  size_t len;
  size_t split;
  unsigned int byte;
  int mode;
  int trailing;

  for (message = 0; message < sizeof(messages) / sizeof(messages[0]); message++) {
    for (length = 0; length < sizeof(lengths) / sizeof(lengths[0]); length++) {
      for (trailing = 0; trailing <= 1; trailing++) {
        prefix_len = strlen(messages[message].prefix);
        memcpy(input, messages[message].prefix, prefix_len);
        memset(input + prefix_len, 'a', lengths[length]);
        value_offset = prefix_len + lengths[length];
        len = value_offset + 1;
        if (trailing) {
          /* Leave enough bytes after the test byte for vectorized scanning. */
          memset(input + len, 'b', 32);
          len += 32;
        }
        memcpy(input + len, messages[message].suffix,
               strlen(messages[message].suffix));
        len += strlen(messages[message].suffix);
        assert(len <= sizeof(input));

        for (mode = 0; mode < 4; mode++) {
          for (byte = 0; byte <= 0xff; byte++) {
            /* CR and LF delimit headers; their handling has separate tests. */
            if (byte == '\r' || byte == '\n')
              continue;
            input[value_offset] = (char) byte;

            check(messages[message].type, mode, input, len, len,
                  value_offset, (unsigned char) byte);
            check(messages[message].type, mode, input, len, value_offset,
                  value_offset, (unsigned char) byte);
            check(messages[message].type, mode, input, len, value_offset + 1,
                  value_offset, (unsigned char) byte);

            /* Exercise every two-buffer split for the NUL regression. */
            if (byte == 0) {
              for (split = 0; split <= len; split++) {
                check(messages[message].type, mode, input, len, split,
                      value_offset, (unsigned char) byte);
              }
            }
          }
        }
      }
    }
  }

  puts("header value byte and buffer-boundary checks passed");
  return 0;
}
