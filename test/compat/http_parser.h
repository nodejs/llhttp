/* Copyright Joyent, Inc. and other Node contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
#ifndef http_parser_h
#define http_parser_h

#include "llhttp.h"

#include <assert.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Also update SONAME in the Makefile whenever you change these. */
#define HTTP_PARSER_VERSION_MAJOR 2
#define HTTP_PARSER_VERSION_MINOR 9
#define HTTP_PARSER_VERSION_PATCH 3

#define http_parser llhttp_t
#define http_parser_settings llhttp_settings_t

#define http_parser_type llhttp_type
#define http_method llhttp_method
#define http_errno llhttp_errno

unsigned long http_parser_version(void)
{
  return LLHTTP_VERSION_MAJOR << 16 | LLHTTP_VERSION_MINOR << 8 | LLHTTP_VERSION_PATCH;
}

const char *http_errno_name(enum http_errno err)
{
  switch(err) {
    case HPE_OK: return "HPE_OK";
    case HPE_INTERNAL: return "HPE_INTERNAL";
    case HPE_STRICT: return "HPE_STRICT";
    case HPE_LF_EXPECTED: return "HPE_LF_EXPECTED";
    case HPE_UNEXPECTED_CONTENT_LENGTH: return "HPE_UNEXPECTED_CONTENT_LENGTH";
    case HPE_CLOSED_CONNECTION: return "HPE_CLOSED_CONNECTION";
    case HPE_INVALID_METHOD: return "HPE_INVALID_METHOD";
    case HPE_INVALID_URL: return "HPE_INVALID_URL";
    case HPE_INVALID_CONSTANT: return "HPE_INVALID_CONSTANT";
    case HPE_INVALID_VERSION: return "HPE_INVALID_VERSION";
    case HPE_INVALID_HEADER_TOKEN: return "HPE_INVALID_HEADER_TOKEN";
    case HPE_INVALID_CONTENT_LENGTH: return "HPE_INVALID_CONTENT_LENGTH";
    case HPE_INVALID_CHUNK_SIZE: return "HPE_INVALID_CHUNK_SIZE";
    case HPE_INVALID_STATUS: return "HPE_INVALID_STATUS";
    case HPE_INVALID_EOF_STATE: return "HPE_INVALID_EOF_STATE";
    case HPE_INVALID_TRANSFER_ENCODING: return "HPE_INVALID_TRANSFER_ENCODING";
    case HPE_CB_MESSAGE_BEGIN: return "HPE_CB_MESSAGE_BEGIN";
    case HPE_CB_HEADERS_COMPLETE: return "HPE_CB_HEADERS_COMPLETE";
    case HPE_CB_MESSAGE_COMPLETE: return "HPE_CB_MESSAGE_COMPLETE";
    case HPE_CB_CHUNK_HEADER: return "HPE_CB_CHUNK_HEADER";
    case HPE_CB_CHUNK_COMPLETE: return "HPE_CB_CHUNK_COMPLETE";
    case HPE_PAUSED: return "HPE_PAUSED";
    case HPE_PAUSED_UPGRADE: return "HPE_PAUSED_UPGRADE";
    case HPE_USER: return "HPE_USER";
  }
  assert(!"reachable - asserts in http-parser");
}

static http_parser* parser_saved;
static enum http_parser_type type_saved;
void http_parser_init(http_parser *parser, enum http_parser_type type)
{
  parser_saved = parser;
  type_saved = type;
}

size_t http_parser_execute(http_parser *parser,
    http_parser_settings *settings,
    const char *data,
    size_t len)
{
  if (len == 4024 && data[0] == 'C')
    printf("execute: sz %d ```C...\n", (int)len);
  else
    printf("execute: sz %d ```\n%.*s\n```\n", (int)len, (int)len, data);

  if (parser_saved) {
    llhttp_init(parser_saved, type_saved, settings);
    parser_saved = NULL;
  }

  // FIXME llhttp doesn't allow settings to change per-execute, does this work?
  parser->settings = settings;

  llhttp_errno_t errno = len ?
    llhttp_execute(parser, data, len) :
    llhttp_finish(parser); // finish(p) replaces execute(p, NULL, 0) for EOF

  if (errno != 0) {
    printf(" => err = %d/%s\n", errno, http_errno_name(errno));
    const char* epos = llhttp_get_error_pos(parser);
    if (epos >= data)
      return llhttp_get_error_pos(parser) - data;
    return 0;
  }

  printf(" => len = %zd\n", len);
  return len;
}

#define http_parser_settings_init llhttp_settings_init

#define http_should_keep_alive llhttp_should_keep_alive

#define HTTP_PARSER_ERRNO llhttp_get_errno

void http_parser_pause(http_parser *parser, int paused)
{
  if (paused)
    llhttp_pause(parser);
  else
    llhttp_resume(parser);
}

#ifdef __cplusplus
}
#endif
#endif
