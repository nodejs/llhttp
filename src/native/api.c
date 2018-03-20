#include <string.h>

#include "http_parser.h"

void http_parser_set_type(http_parser_t* parser, enum http_parser_type type) {
  parser->type = type;
}


void http_parser_set_settings(http_parser_t* parser,
                              http_parser_settings_t* settings) {
  parser->settings = settings;
}


void http_parser_settings_init(http_parser_settings_t* settings) {
  memset(settings, 0, sizeof(*settings));
}
