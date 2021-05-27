#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "llhttp.h"

llhttp_t parser;
llhttp_settings_t settings;

int handle_on_message_complete(llhttp_t* arg) {
	return 0;
}


int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
	/* Initialize user callbacks and settings */
	llhttp_settings_init(&settings);

	/* Set user callback */
	settings.on_message_complete = handle_on_message_complete;
	llhttp_init(&parser, HTTP_BOTH, &settings);
	llhttp_execute(&parser, data, size);

	return 0;
}
