Relaxed header value character parsing
=======================================

Relaxed parsing mode: accepts unusual characters (like control chars)
but still rejects specifally dangerous ones (NULL, CR, LF) that could enable
smuggling attacks.

## Control char in header value (relaxed)

Control characters like form feed should be accepted in relaxed mode.

<!-- meta={"type": "request-lenient-header-value-relaxed"} -->
```http
GET /url HTTP/1.1
Header1: hello\fworld


```

```log
off=0 message begin
off=0 len=3 span[method]="GET"
off=3 method complete
off=4 len=4 span[url]="/url"
off=9 url complete
off=9 len=4 span[protocol]="HTTP"
off=13 protocol complete
off=14 len=3 span[version]="1.1"
off=17 version complete
off=19 len=7 span[header_field]="Header1"
off=27 header_field complete
off=28 len=11 span[header_value]="hello\fworld"
off=41 header_value complete
off=43 headers complete method=1 v=1/1 flags=0 content_length=0
off=43 message complete
```

## Control char in header value (strict)

Control characters should be rejected in strict mode.

<!-- meta={"type": "request"} -->
```http
GET /url HTTP/1.1
Header1: hello\fworld


```

```log
off=0 message begin
off=0 len=3 span[method]="GET"
off=3 method complete
off=4 len=4 span[url]="/url"
off=9 url complete
off=9 len=4 span[protocol]="HTTP"
off=13 protocol complete
off=14 len=3 span[version]="1.1"
off=17 version complete
off=19 len=7 span[header_field]="Header1"
off=27 header_field complete
off=28 len=5 span[header_value]="hello"
off=33 error code=10 reason="Invalid header value char"
```

## LF in header value should be rejected even with relaxed flag

Invalid newlines could enable smuggling and must still be rejected.

<!-- meta={"type": "request-lenient-header-value-relaxed"} -->
```http
POST / HTTP/1.1
Host: localhost:5000
x:\nTransfer-Encoding: chunked

1
A
0

```

```log
off=0 message begin
off=0 len=4 span[method]="POST"
off=4 method complete
off=5 len=1 span[url]="/"
off=7 url complete
off=7 len=4 span[protocol]="HTTP"
off=11 protocol complete
off=12 len=3 span[version]="1.1"
off=15 version complete
off=17 len=4 span[header_field]="Host"
off=22 header_field complete
off=23 len=14 span[header_value]="localhost:5000"
off=39 header_value complete
off=39 len=1 span[header_field]="x"
off=41 header_field complete
off=42 error code=10 reason="Invalid header value char"
```

## CR without LF in header value should be rejected even with relaxed flag

Invalid newlines could enable smuggling and must still be rejected.

<!-- meta={"type": "request-lenient-header-value-relaxed"} -->
```http
POST / HTTP/1.1
Host: localhost:5000
x:\rTransfer-Encoding: chunked

1
A
0

```

```log
off=0 message begin
off=0 len=4 span[method]="POST"
off=4 method complete
off=5 len=1 span[url]="/"
off=7 url complete
off=7 len=4 span[protocol]="HTTP"
off=11 protocol complete
off=12 len=3 span[version]="1.1"
off=15 version complete
off=17 len=4 span[header_field]="Host"
off=22 header_field complete
off=23 len=14 span[header_value]="localhost:5000"
off=39 header_value complete
off=39 len=1 span[header_field]="x"
off=41 header_field complete
off=42 error code=2 reason="Expected LF after CR"
```

## Space after start line must still fail

Unlike LENIENT_HEADERS, this flag should NOT allow space after start line.

<!-- meta={"type": "request-lenient-header-value-relaxed"} -->
```http
GET /url HTTP/1.1
 Header1: value

```

```log
off=0 message begin
off=0 len=3 span[method]="GET"
off=3 method complete
off=4 len=4 span[url]="/url"
off=9 url complete
off=9 len=4 span[protocol]="HTTP"
off=13 protocol complete
off=14 len=3 span[version]="1.1"
off=17 version complete
off=20 error code=30 reason="Unexpected space after start line"
```