Transfer-Encoding header
========================

## `chunked`

### Parsing and setting flag

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: chunked


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=9 url complete
off=19 len=17 span[header_field]="Transfer-Encoding"
off=37 header_field complete
off=38 len=7 span[header_value]="chunked"
off=47 header_value complete
off=49 headers complete method=4 v=1/1 flags=208 content_length=0
```

### Parse chunks with lowercase size

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: chunked

a
0123456789
0


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=9 url complete
off=19 len=17 span[header_field]="Transfer-Encoding"
off=37 header_field complete
off=38 len=7 span[header_value]="chunked"
off=47 header_value complete
off=49 headers complete method=4 v=1/1 flags=208 content_length=0
off=52 chunk header len=10
off=52 len=10 span[body]="0123456789"
off=64 chunk complete
off=67 chunk header len=0
off=69 chunk complete
off=69 message complete
```

### Parse chunks with uppercase size

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: chunked

A
0123456789
0


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=9 url complete
off=19 len=17 span[header_field]="Transfer-Encoding"
off=37 header_field complete
off=38 len=7 span[header_value]="chunked"
off=47 header_value complete
off=49 headers complete method=4 v=1/1 flags=208 content_length=0
off=52 chunk header len=10
off=52 len=10 span[body]="0123456789"
off=64 chunk complete
off=67 chunk header len=0
off=69 chunk complete
off=69 message complete
```

### POST with `Transfer-Encoding: chunked`

<!-- meta={"type": "request"} -->
```http
POST /post_chunked_all_your_base HTTP/1.1
Transfer-Encoding: chunked

1e
all your base are belong to us
0


```

```log
off=0 message begin
off=5 len=27 span[url]="/post_chunked_all_your_base"
off=33 url complete
off=43 len=17 span[header_field]="Transfer-Encoding"
off=61 header_field complete
off=62 len=7 span[header_value]="chunked"
off=71 header_value complete
off=73 headers complete method=3 v=1/1 flags=208 content_length=0
off=77 chunk header len=30
off=77 len=30 span[body]="all your base are belong to us"
off=109 chunk complete
off=112 chunk header len=0
off=114 chunk complete
off=114 message complete
```

### Two chunks and triple zero prefixed end chunk

<!-- meta={"type": "request"} -->
```http
POST /two_chunks_mult_zero_end HTTP/1.1
Transfer-Encoding: chunked

5
hello
6
 world
000


```

```log
off=0 message begin
off=5 len=25 span[url]="/two_chunks_mult_zero_end"
off=31 url complete
off=41 len=17 span[header_field]="Transfer-Encoding"
off=59 header_field complete
off=60 len=7 span[header_value]="chunked"
off=69 header_value complete
off=71 headers complete method=3 v=1/1 flags=208 content_length=0
off=74 chunk header len=5
off=74 len=5 span[body]="hello"
off=81 chunk complete
off=84 chunk header len=6
off=84 len=6 span[body]=" world"
off=92 chunk complete
off=97 chunk header len=0
off=99 chunk complete
off=99 message complete
```

### Trailing headers

<!-- meta={"type": "request"} -->
```http
POST /chunked_w_trailing_headers HTTP/1.1
Transfer-Encoding: chunked

5
hello
6
 world
0
Vary: *
Content-Type: text/plain


```

```log
off=0 message begin
off=5 len=27 span[url]="/chunked_w_trailing_headers"
off=33 url complete
off=43 len=17 span[header_field]="Transfer-Encoding"
off=61 header_field complete
off=62 len=7 span[header_value]="chunked"
off=71 header_value complete
off=73 headers complete method=3 v=1/1 flags=208 content_length=0
off=76 chunk header len=5
off=76 len=5 span[body]="hello"
off=83 chunk complete
off=86 chunk header len=6
off=86 len=6 span[body]=" world"
off=94 chunk complete
off=97 chunk header len=0
off=97 len=4 span[header_field]="Vary"
off=102 header_field complete
off=103 len=1 span[header_value]="*"
off=106 header_value complete
off=106 len=12 span[header_field]="Content-Type"
off=119 header_field complete
off=120 len=10 span[header_value]="text/plain"
off=132 header_value complete
off=134 chunk complete
off=134 message complete
```

### Parameters after chunk length

<!-- meta={"type": "request"} -->
```http
POST /chunked_w_unicorns_after_length HTTP/1.1
Transfer-Encoding: chunked

5; ilovew3;somuchlove=aretheseparametersfor
hello
6; blahblah; blah
 world
0

```

```log
off=0 message begin
off=5 len=32 span[url]="/chunked_w_unicorns_after_length"
off=38 url complete
off=48 len=17 span[header_field]="Transfer-Encoding"
off=66 header_field complete
off=67 len=7 span[header_value]="chunked"
off=76 header_value complete
off=78 headers complete method=3 v=1/1 flags=208 content_length=0
off=123 chunk header len=5
off=123 len=5 span[body]="hello"
off=130 chunk complete
off=149 chunk header len=6
off=149 len=6 span[body]=" world"
off=157 chunk complete
off=160 chunk header len=0
```

## Ignoring `pigeons`

Requests cannot have invalid `Transfer-Encoding`. It is impossible to determine
their body size. Not erroring would make HTTP smuggling attacks possible.

<!-- meta={"type": "request", "noScan": true} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: pigeons


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=9 url complete
off=19 len=17 span[header_field]="Transfer-Encoding"
off=37 header_field complete
off=38 len=7 span[header_value]="pigeons"
off=47 header_value complete
off=49 headers complete method=4 v=1/1 flags=200 content_length=0
off=49 error code=15 reason="Request has invalid `Transfer-Encoding`"
```

## POST with `Transfer-Encoding` and `Content-Length`

<!-- meta={"type": "request"} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: identity
Content-Length: 5

World
```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=8 span[header_value]="identity"
off=96 header_value complete
off=96 len=14 span[header_field]="Content-Length"
off=111 header_field complete
off=112 len=1 span[header_value]="5"
off=115 header_value complete
off=117 error code=4 reason="Content-Length can't be present with Transfer-Encoding"
```

## POST with `Transfer-Encoding` and `Content-Length` (lenient)

TODO(indutny): should we allow it even in lenient mode? (Consider disabling
this).

NOTE: `Content-Length` is ignored when `Transfer-Encoding` is present. Messages
(in lenient mode) are read until EOF.

<!-- meta={"type": "request-lenient-chunked-length"} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: identity
Content-Length: 1

World
```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=8 span[header_value]="identity"
off=96 header_value complete
off=96 len=14 span[header_field]="Content-Length"
off=111 header_field complete
off=112 len=1 span[header_value]="1"
off=115 header_value complete
off=117 headers complete method=3 v=1/1 flags=220 content_length=1
off=117 len=5 span[body]="World"
```

## POST with `chunked` before other transfer coding names

<!-- meta={"type": "request", "noScan": true} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: chunked, deflate

World
```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=16 span[header_value]="chunked, deflate"
off=104 header_value complete
off=106 headers complete method=3 v=1/1 flags=200 content_length=0
off=106 error code=15 reason="Request has invalid `Transfer-Encoding`"
```

## POST with `chunked` and duplicate transfer-encoding

<!-- meta={"type": "request", "noScan": true} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: chunked
Transfer-Encoding: deflate

World
```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=7 span[header_value]="chunked"
off=95 header_value complete
off=95 len=17 span[header_field]="Transfer-Encoding"
off=113 header_field complete
off=114 len=7 span[header_value]="deflate"
off=123 header_value complete
off=125 headers complete method=3 v=1/1 flags=200 content_length=0
off=125 error code=15 reason="Request has invalid `Transfer-Encoding`"
```

## POST with `chunked` before other transfer-coding (lenient)

TODO(indutny): should we allow it even in lenient mode? (Consider disabling
this).

<!-- meta={"type": "request-lenient-chunked-length"} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: chunked, deflate

World
```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=16 span[header_value]="chunked, deflate"
off=104 header_value complete
off=106 headers complete method=3 v=1/1 flags=200 content_length=0
off=106 len=5 span[body]="World"
```

## POST with `chunked` as last transfer-coding

<!-- meta={"type": "request"} -->
```http
POST /post_identity_body_world?q=search#hey HTTP/1.1
Accept: */*
Transfer-Encoding: deflate, chunked

5
World
0


```

```log
off=0 message begin
off=5 len=38 span[url]="/post_identity_body_world?q=search#hey"
off=44 url complete
off=54 len=6 span[header_field]="Accept"
off=61 header_field complete
off=62 len=3 span[header_value]="*/*"
off=67 header_value complete
off=67 len=17 span[header_field]="Transfer-Encoding"
off=85 header_field complete
off=86 len=16 span[header_value]="deflate, chunked"
off=104 header_value complete
off=106 headers complete method=3 v=1/1 flags=208 content_length=0
off=109 chunk header len=5
off=109 len=5 span[body]="World"
off=116 chunk complete
off=119 chunk header len=0
off=121 chunk complete
off=121 message complete
```

## Missing last-chunk

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: chunked

3
foo


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=9 url complete
off=19 len=17 span[header_field]="Transfer-Encoding"
off=37 header_field complete
off=38 len=7 span[header_value]="chunked"
off=47 header_value complete
off=49 headers complete method=4 v=1/1 flags=208 content_length=0
off=52 chunk header len=3
off=52 len=3 span[body]="foo"
off=57 chunk complete
off=57 error code=12 reason="Invalid character in chunk size"
```
