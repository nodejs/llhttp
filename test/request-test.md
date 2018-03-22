# LLHTTP requests

## Simple request

<!-- meta={"type": "request"} -->
```http
OPTIONS /url HTTP/1.1
Header1: Value1
Header2:\t Value2


```

```log
off=0 message begin
off=8 len=4 span[url]="/url"
off=23 len=7 span[header_field]="Header1"
off=32 len=6 span[header_value]="Value1"
off=40 len=7 span[header_field]="Header2"
off=50 len=6 span[header_value]="Value2"
off=60 headers complete method=6 v=1/1 flags=0 content_length=0
off=60 message complete
```

## Request with method starting with `H`

There's a optimization in `start_req_or_res` that passes execution to
`start_req` when the first character is not `H` (because response must start
with `HTTP/`). However, there're still methods like `HEAD` that should get
to `start_req`. Verify that it still works after optimization.

<!-- meta={"type": "request"} -->
```http
HEAD /url HTTP/1.1


```

```log
off=0 message begin
off=5 len=4 span[url]="/url"
off=22 headers complete method=2 v=1/1 flags=0 content_length=0
off=22 message complete
```

## `Content-Length` header

### `Content-Length` with zeroes

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Content-Length: 003

abc
```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=3 span[header_value]="003"
off=42 headers complete method=4 v=1/1 flags=20 content_length=3
off=42 len=3 span[body]="abc"
off=45 message complete
```

### `Content-Length` with follow-up headers

The way the parser works is that special headers (like `Content-Length`) first
set `header_state` to appropriate value, and then apply custom parsing using
that value. For `Content-Length`, in particular, the `header_state` is used for
setting the flag too.

Make sure that `header_state` is reset to `0`, so that the flag won't be
attempted to set twice (and error).

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Content-Length: 003
Ohai: world

abc
```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=3 span[header_value]="003"
off=40 len=4 span[header_field]="Ohai"
off=46 len=5 span[header_value]="world"
off=55 headers complete method=4 v=1/1 flags=20 content_length=3
off=55 len=3 span[body]="abc"
off=58 message complete
```

### `Content-Length` overflow

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Content-Length: 1000000000000000000000

```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=21 span[header_value]="100000000000000000000"
off=56 error code=11 reason="Content-Length overflow"
```

### Disallow duplicate `Content-Length`

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Content-Length: 1
Content-Length: 2

```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=1 span[header_value]="1"
off=38 len=14 span[header_field]="Content-Length"
off=54 error code=4 reason="Duplicate Content-Length"
```

## `Transfer-Encoding` header

### Parse `chunked` and set flag

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: chunked


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=17 span[header_field]="Transfer-Encoding"
off=38 len=7 span[header_value]="chunked"
off=49 headers complete method=4 v=1/1 flags=8 content_length=0
```

### Ignore `pigeons`

`flags` should not be changed.

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Transfer-Encoding: pigeons


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=17 span[header_field]="Transfer-Encoding"
off=38 len=7 span[header_value]="pigeons"
off=49 headers complete method=4 v=1/1 flags=0 content_length=0
off=49 message complete
```

## `Connection` header

### `keep-alive` should set flag

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: keep-alive


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=10 span[header_value]="keep-alive"
off=45 headers complete method=4 v=1/1 flags=1 content_length=0
off=45 message complete
```
