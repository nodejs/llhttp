CC ?= clang
LD ?= clang

CFLAGS ?=
CFLAGS += -Os -Wall -Wextra -Wno-unused-parameter

all: build build/libhttp_parser.a

test: all build/test

build:
	mkdir -p build

build/test: build/libhttp_parser.a src/test.c
	$(CC) $(CFLAGS) -Iinclude/ src/test.c -o $@ build/libhttp_parser.a

build/libhttp_parser.a: build/bindings.o build/http_parser.o
	$(AR) rcs $@ build/bindings.o build/http_parser.o

build/bindings.o: src/bindings.c build/http_parser.o
	$(CC) $(CFLAGS) -Iinclude/ -c src/bindings.c -o $@

build/http_parser.o: build/http_parser.ll
	$(CC) $(CFLAGS) -c $< -o $@

build/http_parser.ll: lib/*.js lib/**/*.js bin/*
	./bin/build.js

.PHONY: all
