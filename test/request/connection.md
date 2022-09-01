Connection header
=================

## `keep-alive`

### Setting flag

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

### Restarting when keep-alive is explicitly

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

### No restart when keep-alive is off (1.0) and parser is in strict mode

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

### Resetting flags when keep-alive is off (1.0) and parser is in loose mode

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
off=89 headers complete method=4 v=1/1 flags=208 content_length=0
```

### CRLF between requests, implicit `keep-alive`

<!-- meta={"type": "request"} -->
```http
POST / HTTP/1.1
Host: www.example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 4

q=42

GET / HTTP/1.1
```
_Note the trailing CRLF above_

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=17 len=4 span[header_field]="Host"
off=23 len=15 span[header_value]="www.example.com"
off=40 len=12 span[header_field]="Content-Type"
off=54 len=33 span[header_value]="application/x-www-form-urlencoded"
off=89 len=14 span[header_field]="Content-Length"
off=105 len=1 span[header_value]="4"
off=110 headers complete method=3 v=1/1 flags=20 content_length=4
off=110 len=4 span[body]="q=42"
off=114 message complete
off=118 message begin
off=122 len=1 span[url]="/"
```

### Not treating `\r` as `-`

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection: keep\ralive


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=31 len=4 span[header_value]="keep"
off=36 error code=3 reason="Missing expected LF after header value"
```

## `close`

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

### CRLF between requests, explicit `close` (strict mode)

`close` means closed connection in strict mode.

<!-- meta={"type": "request", "mode": "strict"} -->
```http
POST / HTTP/1.1
Host: www.example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
Connection: close

q=42

GET / HTTP/1.1
```
_Note the trailing CRLF above_

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=17 len=4 span[header_field]="Host"
off=23 len=15 span[header_value]="www.example.com"
off=40 len=12 span[header_field]="Content-Type"
off=54 len=33 span[header_value]="application/x-www-form-urlencoded"
off=89 len=14 span[header_field]="Content-Length"
off=105 len=1 span[header_value]="4"
off=108 len=10 span[header_field]="Connection"
off=120 len=5 span[header_value]="close"
off=129 headers complete method=3 v=1/1 flags=22 content_length=4
off=129 len=4 span[body]="q=42"
off=133 message complete
off=138 error code=5 reason="Data after `Connection: close`"
```

### CRLF between requests, explicit `close` (loose mode)

Loose mode is more lenient, and allows further requests.

<!-- meta={"type": "request", "mode": "loose"} -->
```http
POST / HTTP/1.1
Host: www.example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
Connection: close

q=42

GET / HTTP/1.1
```
_Note the trailing CRLF above_

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=17 len=4 span[header_field]="Host"
off=23 len=15 span[header_value]="www.example.com"
off=40 len=12 span[header_field]="Content-Type"
off=54 len=33 span[header_value]="application/x-www-form-urlencoded"
off=89 len=14 span[header_field]="Content-Length"
off=105 len=1 span[header_value]="4"
off=108 len=10 span[header_field]="Connection"
off=120 len=5 span[header_value]="close"
off=129 headers complete method=3 v=1/1 flags=22 content_length=4
off=129 len=4 span[body]="q=42"
off=133 message complete
off=137 message begin
off=141 len=1 span[url]="/"
```

## Parsing multiple tokens

### Sample

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

### Multiple tokens with folding

<!-- meta={"type": "request"} -->
```http
GET /demo HTTP/1.1
Host: example.com
Connection: Something,
 Upgrade, ,Keep-Alive
Sec-WebSocket-Key2: 12998 5 Y3 1  .P00
Sec-WebSocket-Protocol: sample
Upgrade: WebSocket
Sec-WebSocket-Key1: 4 @1  46546xW%0l 1 5
Origin: http://example.com

Hot diggity dogg
```

```log
off=0 message begin
off=4 len=5 span[url]="/demo"
off=20 len=4 span[header_field]="Host"
off=26 len=11 span[header_value]="example.com"
off=39 len=10 span[header_field]="Connection"
off=51 len=10 span[header_value]="Something,"
off=63 len=21 span[header_value]=" Upgrade, ,Keep-Alive"
off=86 len=18 span[header_field]="Sec-WebSocket-Key2"
off=106 len=18 span[header_value]="12998 5 Y3 1  .P00"
off=126 len=22 span[header_field]="Sec-WebSocket-Protocol"
off=150 len=6 span[header_value]="sample"
off=158 len=7 span[header_field]="Upgrade"
off=167 len=9 span[header_value]="WebSocket"
off=178 len=18 span[header_field]="Sec-WebSocket-Key1"
off=198 len=20 span[header_value]="4 @1  46546xW%0l 1 5"
off=220 len=6 span[header_field]="Origin"
off=228 len=18 span[header_value]="http://example.com"
off=250 headers complete method=1 v=1/1 flags=15 content_length=0
off=250 message complete
off=250 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Multiple tokens with folding and LWS

<!-- meta={"type": "request"} -->
```http
GET /demo HTTP/1.1
Connection: keep-alive, upgrade
Upgrade: WebSocket

Hot diggity dogg
```

```log
off=0 message begin
off=4 len=5 span[url]="/demo"
off=20 len=10 span[header_field]="Connection"
off=32 len=19 span[header_value]="keep-alive, upgrade"
off=53 len=7 span[header_field]="Upgrade"
off=62 len=9 span[header_value]="WebSocket"
off=75 headers complete method=1 v=1/1 flags=15 content_length=0
off=75 message complete
off=75 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Multiple tokens with folding, LWS, and CRLF

<!-- meta={"type": "request"} -->
```http
GET /demo HTTP/1.1
Connection: keep-alive, \r\n upgrade
Upgrade: WebSocket

Hot diggity dogg
```

```log
off=0 message begin
off=4 len=5 span[url]="/demo"
off=20 len=10 span[header_field]="Connection"
off=32 len=12 span[header_value]="keep-alive, "
off=46 len=8 span[header_value]=" upgrade"
off=56 len=7 span[header_field]="Upgrade"
off=65 len=9 span[header_value]="WebSocket"
off=78 headers complete method=1 v=1/1 flags=15 content_length=0
off=78 message complete
off=78 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Invalid whitespace token with `Connection` header field

<!-- meta={"type": "request"} -->
```http
PUT /url HTTP/1.1
Connection : upgrade
Content-Length: 4
Upgrade: ws

abcdefgh
```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=10 span[header_field]="Connection"
off=30 error code=10 reason="Invalid header field char"
```

### Invalid whitespace token with `Connection` header field (lenient)

<!-- meta={"type": "request-lenient"} -->
```http
PUT /url HTTP/1.1
Connection : upgrade
Content-Length: 4
Upgrade: ws

abcdefgh
```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=11 span[header_field]="Connection "
off=32 len=7 span[header_value]="upgrade"
off=41 len=14 span[header_field]="Content-Length"
off=57 len=1 span[header_value]="4"
off=60 len=7 span[header_field]="Upgrade"
off=69 len=2 span[header_value]="ws"
off=75 headers complete method=4 v=1/1 flags=134 content_length=4
off=75 len=4 span[body]="abcd"
off=79 message complete
off=79 error code=22 reason="Pause on CONNECT/Upgrade"
```

## `upgrade`

### Setting a flag and pausing

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
off=55 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Emitting part of body and pausing

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
off=78 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Upgrade GET request

<!-- meta={"type": "request"} -->
```http
GET /demo HTTP/1.1
Host: example.com
Connection: Upgrade
Sec-WebSocket-Key2: 12998 5 Y3 1  .P00
Sec-WebSocket-Protocol: sample
Upgrade: WebSocket
Sec-WebSocket-Key1: 4 @1  46546xW%0l 1 5
Origin: http://example.com

Hot diggity dogg
```

```log
off=0 message begin
off=4 len=5 span[url]="/demo"
off=20 len=4 span[header_field]="Host"
off=26 len=11 span[header_value]="example.com"
off=39 len=10 span[header_field]="Connection"
off=51 len=7 span[header_value]="Upgrade"
off=60 len=18 span[header_field]="Sec-WebSocket-Key2"
off=80 len=18 span[header_value]="12998 5 Y3 1  .P00"
off=100 len=22 span[header_field]="Sec-WebSocket-Protocol"
off=124 len=6 span[header_value]="sample"
off=132 len=7 span[header_field]="Upgrade"
off=141 len=9 span[header_value]="WebSocket"
off=152 len=18 span[header_field]="Sec-WebSocket-Key1"
off=172 len=20 span[header_value]="4 @1  46546xW%0l 1 5"
off=194 len=6 span[header_field]="Origin"
off=202 len=18 span[header_value]="http://example.com"
off=224 headers complete method=1 v=1/1 flags=14 content_length=0
off=224 message complete
off=224 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Upgrade POST request

<!-- meta={"type": "request"} -->
```http
POST /demo HTTP/1.1
Host: example.com
Connection: Upgrade
Upgrade: HTTP/2.0
Content-Length: 15

sweet post body\
Hot diggity dogg
```

```log
off=0 message begin
off=5 len=5 span[url]="/demo"
off=21 len=4 span[header_field]="Host"
off=27 len=11 span[header_value]="example.com"
off=40 len=10 span[header_field]="Connection"
off=52 len=7 span[header_value]="Upgrade"
off=61 len=7 span[header_field]="Upgrade"
off=70 len=8 span[header_value]="HTTP/2.0"
off=80 len=14 span[header_field]="Content-Length"
off=96 len=2 span[header_value]="15"
off=102 headers complete method=3 v=1/1 flags=34 content_length=15
off=102 len=15 span[body]="sweet post body"
off=117 message complete
off=117 error code=22 reason="Pause on CONNECT/Upgrade"
```
