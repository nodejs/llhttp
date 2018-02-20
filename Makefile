CC ?= clang
LD ?= clang

CFLAGS ?=
CFLAGS += -g3 -Os -Wall -Wextra -Wno-unused-parameter

all: build build/libhttp_parser.a

test: all build/test

build:
	mkdir -p build

build/test: build/libhttp_parser.a src/test.c
	$(CC) $(CFLAGS) -Iinclude/ src/test.c -o $@ build/libhttp_parser.a

build/libhttp_parser.a: build/bindings.o build/http.o
	$(AR) rcs $@ build/bindings.o build/http.o

build/bindings.o: src/bindings.c include/http_parser.h
	$(CC) $(CFLAGS) -Iinclude/ -c src/bindings.c -o $@

build/http.o: build/http.ll
	$(CC) $(CFLAGS) -c build/http.ll -o $@

build/http.ll: lib/*.js lib/**/*.js bin/*
	./bin/build.js > $@

.PHONY: all
