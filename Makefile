CLANG ?= clang
CFLAGS ?=

CFLAGS += -Os -g3
INCLUDES += -Ibuild/

all: build/libhttp_parser.a

clean:
	rm -rf build/

build/libhttp_parser.a: build/bitcode/http_parser.o build/native/api.o \
		build/native/http.o
	$(AR) rcs $@ build/bitcode/http_parser.o build/native/api.o build/native/http.o

build/bitcode/http_parser.o: build/bitcode/http_parser.bc
	$(CLANG) $(CFLAGS) -c $< -o $@

build/native/%.o: src/native/%.c build/http_parser.h src/native/api.h \
		build/native
	$(CLANG) $(CFLAGS) $(INCLUDES) -c $< -o $@

build/http_parser.h: bitcode
build/bitcode/http_parser.bc: bitcode

build/native:
	mkdir -p build/native

bitcode:
	./bin/build.ts

.PHONY: all bitcode clean
