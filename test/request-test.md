# LLHTTP requests

## Sample requests

### Simple request

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

### Request with method starting with `H`

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

### curl GET

<!-- meta={"type": "request"} -->
```http
GET /test HTTP/1.1
User-Agent: curl/7.18.0 (i486-pc-linux-gnu) libcurl/7.18.0 OpenSSL/0.9.8g zlib/1.2.3.3 libidn/1.1
Host: 0.0.0.0=5000
Accept: */*


```

```log
off=0 message begin
off=4 len=5 span[url]="/test"
off=20 len=10 span[header_field]="User-Agent"
off=32 len=85 span[header_value]="curl/7.18.0 (i486-pc-linux-gnu) libcurl/7.18.0 OpenSSL/0.9.8g zlib/1.2.3.3 libidn/1.1"
off=119 len=4 span[header_field]="Host"
off=125 len=12 span[header_value]="0.0.0.0=5000"
off=139 len=6 span[header_field]="Accept"
off=147 len=3 span[header_value]="*/*"
off=154 headers complete method=1 v=1/1 flags=0 content_length=0
off=154 message complete
```

### Firefox GET

<!-- meta={"type": "request"} -->
```http
GET /favicon.ico HTTP/1.1
Host: 0.0.0.0=5000
User-Agent: Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9) Gecko/2008061015 Firefox/3.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive: 300
Connection: keep-alive


```

```log
off=0 message begin
off=4 len=12 span[url]="/favicon.ico"
off=27 len=4 span[header_field]="Host"
off=33 len=12 span[header_value]="0.0.0.0=5000"
off=47 len=10 span[header_field]="User-Agent"
off=59 len=76 span[header_value]="Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9) Gecko/2008061015 Firefox/3.0"
off=137 len=6 span[header_field]="Accept"
off=145 len=63 span[header_value]="text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
off=210 len=15 span[header_field]="Accept-Language"
off=227 len=14 span[header_value]="en-us,en;q=0.5"
off=243 len=15 span[header_field]="Accept-Encoding"
off=260 len=12 span[header_value]="gzip,deflate"
off=274 len=14 span[header_field]="Accept-Charset"
off=290 len=30 span[header_value]="ISO-8859-1,utf-8;q=0.7,*;q=0.7"
off=322 len=10 span[header_field]="Keep-Alive"
off=334 len=3 span[header_value]="300"
off=339 len=10 span[header_field]="Connection"
off=351 len=10 span[header_value]="keep-alive"
off=365 headers complete method=1 v=1/1 flags=1 content_length=0
off=365 message complete
```

### DUMBPACK

<!-- meta={"type": "request"} -->
```http
GET /dumbpack HTTP/1.1
aaaaaaaaaaaaa:++++++++++


```

```log
off=0 message begin
off=4 len=9 span[url]="/dumbpack"
off=24 len=13 span[header_field]="aaaaaaaaaaaaa"
off=38 len=10 span[header_value]="++++++++++"
off=52 headers complete method=1 v=1/1 flags=0 content_length=0
off=52 message complete
```

---

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

### Error on `Content-Length` overflow

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

### Error on duplicate `Content-Length`

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

### Error on simultaneous `Content-Length` and `Transfer-Encoding: chunked`

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Content-Length: 1
Transfer-Encoding: chunked


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=1 span[header_value]="1"
off=38 len=17 span[header_field]="Transfer-Encoding"
off=57 len=7 span[header_value]="chunked"
off=68 error code=4 reason="Content-Length can't be present with chunked encoding"
```

---

## `Transfer-Encoding` header

### `chunked`

#### Parsing and setting flag

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

#### Parse chunks with lowercase size

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
off=19 len=17 span[header_field]="Transfer-Encoding"
off=38 len=7 span[header_value]="chunked"
off=49 headers complete method=4 v=1/1 flags=8 content_length=0
off=52 chunk header len=10
off=52 len=10 span[body]="0123456789"
off=64 chunk complete
off=67 chunk header len=0
off=69 chunk complete
off=69 message complete
```

#### Parse chunks with uppercase size

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
off=19 len=17 span[header_field]="Transfer-Encoding"
off=38 len=7 span[header_value]="chunked"
off=49 headers complete method=4 v=1/1 flags=8 content_length=0
off=52 chunk header len=10
off=52 len=10 span[body]="0123456789"
off=64 chunk complete
off=67 chunk header len=0
off=69 chunk complete
off=69 message complete
```

### Ignoring `pigeons`

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

---

## `Connection` header

### `keep-alive`

#### Setting flag

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

#### Restarting when keep-alive is explicitly

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: keep-alive

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
off=45 message begin
off=49 len=4 span[url]="/url"
off=64 len=10 span[header_field]="Connection"
off=76 len=10 span[header_value]="keep-alive"
off=90 headers complete method=4 v=1/1 flags=1 content_length=0
off=90 message complete
```

#### No restart when keep-alive is off (1.0) and parser is in strict mode

<!-- meta={"type": "request", "mode": "strict"} -->
```http
PUT /url HTTP/1.0

PUT /url HTTP/1.1


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=21 headers complete method=4 v=1/0 flags=0 content_length=0
off=21 message complete
off=22 error code=5 reason="Data after `Connection: close`"
```

#### Resetting flags when keep-alive is off (1.0) and parser is in loose mode

Even though we allow restarts in loose mode, the flags should be still set to
`0` upon restart.

<!-- meta={"type": "request", "mode": "loose"} -->
```http
PUT /url HTTP/1.0
Content-Length: 0

PUT /url HTTP/1.1
Transfer-Encoding: chunked


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=14 span[header_field]="Content-Length"
off=35 len=1 span[header_value]="0"
off=40 headers complete method=4 v=1/0 flags=20 content_length=0
off=40 message complete
off=40 message begin
off=44 len=4 span[url]="/url"
off=59 len=17 span[header_field]="Transfer-Encoding"
off=78 len=7 span[header_value]="chunked"
off=89 headers complete method=4 v=1/1 flags=8 content_length=0
```

### Setting flag on `close`

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: close


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=5 span[header_value]="close"
off=40 headers complete method=4 v=1/1 flags=2 content_length=0
off=40 message complete
```

### Parsing multiple tokens

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: close, token, upgrade, token, keep-alive


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=40 span[header_value]="close, token, upgrade, token, keep-alive"
off=75 headers complete method=4 v=1/1 flags=7 content_length=0
off=75 message complete
```

### `upgrade`

#### Setting a flag and pausing

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: upgrade
Upgrade: ws


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=7 span[header_value]="upgrade"
off=40 len=7 span[header_field]="Upgrade"
off=49 len=2 span[header_value]="ws"
off=55 headers complete method=4 v=1/1 flags=14 content_length=0
off=55 message complete
off=55 error code=21 reason="Pause on CONNECT/Upgrade"
```

#### Emitting part of body and pausing

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: upgrade
Content-Length: 4
Upgrade: ws

abcdefgh
```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=7 span[header_value]="upgrade"
off=40 len=14 span[header_field]="Content-Length"
off=56 len=1 span[header_value]="4"
off=59 len=7 span[header_field]="Upgrade"
off=68 len=2 span[header_value]="ws"
off=74 headers complete method=4 v=1/1 flags=34 content_length=4
off=74 len=4 span[body]="abcd"
off=78 message complete
off=78 error code=21 reason="Pause on CONNECT/Upgrade"
```

---
