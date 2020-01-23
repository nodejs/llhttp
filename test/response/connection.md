Connection header
=================

## Proxy-Connection

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 11
Proxy-Connection: close
Date: Thu, 31 Dec 2009 20:55:48 +0000

hello world
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=12 span[header_field]="Content-Type"
off=31 len=24 span[header_value]="text/html; charset=UTF-8"
off=57 len=14 span[header_field]="Content-Length"
off=73 len=2 span[header_value]="11"
off=77 len=16 span[header_field]="Proxy-Connection"
off=95 len=5 span[header_value]="close"
off=102 len=4 span[header_field]="Date"
off=108 len=31 span[header_value]="Thu, 31 Dec 2009 20:55:48 +0000"
off=143 headers complete status=200 v=1/1 flags=22 content_length=11
off=143 len=11 span[body]="hello world"
off=154 message complete
```

## HTTP/1.0 with keep-alive and EOF-terminated 200 status

There is no `Content-Length` in this response, so even though the
`keep-alive` is on - it should read until EOF.

<!-- meta={"type": "response"} -->
```http
HTTP/1.0 200 OK
Connection: keep-alive

HTTP/1.0 200 OK
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=10 span[header_field]="Connection"
off=29 len=10 span[header_value]="keep-alive"
off=43 headers complete status=200 v=1/0 flags=1 content_length=0
off=43 len=15 span[body]="HTTP/1.0 200 OK"
```

## HTTP/1.0 with keep-alive and 204 status

Responses with `204` status cannot have a body.

<!-- meta={"type": "response"} -->
```http
HTTP/1.0 204 No content
Connection: keep-alive

HTTP/1.0 200 OK
```

```log
off=0 message begin
off=13 len=10 span[status]="No content"
off=25 len=10 span[header_field]="Connection"
off=37 len=10 span[header_value]="keep-alive"
off=51 headers complete status=204 v=1/0 flags=1 content_length=0
off=51 message complete
off=51 message begin
off=64 len=2 span[status]="OK"
```

## HTTP/1.1 with EOF-terminated 200 status

There is no `Content-Length` in this response, so even though the
`keep-alive` is on (implicitly in HTTP 1.1) - it should read until EOF.

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK

HTTP/1.1 200 OK
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=19 headers complete status=200 v=1/1 flags=0 content_length=0
off=19 len=15 span[body]="HTTP/1.1 200 OK"
```

## HTTP/1.1 with 204 status

Responses with `204` status cannot have a body.

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 204 No content

HTTP/1.1 200 OK
```

```log
off=0 message begin
off=13 len=10 span[status]="No content"
off=27 headers complete status=204 v=1/1 flags=0 content_length=0
off=27 message complete
off=27 message begin
off=40 len=2 span[status]="OK"
```

## HTTP/1.1 with keep-alive disabled and 204 status in strict mode

<!-- meta={"type": "response", "mode": "strict"} -->
```http
HTTP/1.1 204 No content
Connection: close

HTTP/1.1 200 OK
```

```log
off=0 message begin
off=13 len=10 span[status]="No content"
off=25 len=10 span[header_field]="Connection"
off=37 len=5 span[header_value]="close"
off=46 headers complete status=204 v=1/1 flags=2 content_length=0
off=46 message complete
off=47 error code=5 reason="Data after `Connection: close`"
```

## HTTP/1.1 with keep-alive disabled and 204 status in loose mode

<!-- meta={"type": "response", "mode": "loose"} -->
```http
HTTP/1.1 204 No content
Connection: close

HTTP/1.1 200 OK
```

```log
off=0 message begin
off=13 len=10 span[status]="No content"
off=25 len=10 span[header_field]="Connection"
off=37 len=5 span[header_value]="close"
off=46 headers complete status=204 v=1/1 flags=2 content_length=0
off=46 message complete
off=46 message begin
off=59 len=2 span[status]="OK"
```

## HTTP 101 response with Upgrade and Content-Length header

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 101 Switching Protocols
Connection: upgrade
Upgrade: h2c
Content-Length: 4

body\
proto
```

```log
off=0 message begin
off=13 len=19 span[status]="Switching Protocols"
off=34 len=10 span[header_field]="Connection"
off=46 len=7 span[header_value]="upgrade"
off=55 len=7 span[header_field]="Upgrade"
off=64 len=3 span[header_value]="h2c"
off=69 len=14 span[header_field]="Content-Length"
off=85 len=1 span[header_value]="4"
off=90 headers complete status=101 v=1/1 flags=34 content_length=4
off=90 len=4 span[body]="body"
off=94 message complete
off=94 error code=22 reason="Pause on CONNECT/Upgrade"
```

## HTTP 101 response with Upgrade and Transfer-Encoding header

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 101 Switching Protocols
Connection: upgrade
Upgrade: h2c
Transfer-Encoding: chunked

2
bo
2
dy
0

proto
```

```log
off=0 message begin
off=13 len=19 span[status]="Switching Protocols"
off=34 len=10 span[header_field]="Connection"
off=46 len=7 span[header_value]="upgrade"
off=55 len=7 span[header_field]="Upgrade"
off=64 len=3 span[header_value]="h2c"
off=69 len=17 span[header_field]="Transfer-Encoding"
off=88 len=7 span[header_value]="chunked"
off=99 headers complete status=101 v=1/1 flags=21c content_length=0
off=102 chunk header len=2
off=102 len=2 span[body]="bo"
off=106 chunk complete
off=109 chunk header len=2
off=109 len=2 span[body]="dy"
off=113 chunk complete
off=116 chunk header len=0
off=118 chunk complete
off=118 message complete
off=118 error code=22 reason="Pause on CONNECT/Upgrade"
```

## HTTP 200 response with Upgrade header

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Connection: upgrade
Upgrade: h2c

body
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=10 span[header_field]="Connection"
off=29 len=7 span[header_value]="upgrade"
off=38 len=7 span[header_field]="Upgrade"
off=47 len=3 span[header_value]="h2c"
off=54 headers complete status=200 v=1/1 flags=14 content_length=0
off=54 len=4 span[body]="body"
```

## HTTP 200 response with Upgrade header and Content-Length

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Connection: upgrade
Upgrade: h2c
Content-Length: 4

body
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=10 span[header_field]="Connection"
off=29 len=7 span[header_value]="upgrade"
off=38 len=7 span[header_field]="Upgrade"
off=47 len=3 span[header_value]="h2c"
off=52 len=14 span[header_field]="Content-Length"
off=68 len=1 span[header_value]="4"
off=73 headers complete status=200 v=1/1 flags=34 content_length=4
off=73 len=4 span[body]="body"
off=77 message complete
```

## HTTP 200 response with Upgrade header and Transfer-Encoding

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Connection: upgrade
Upgrade: h2c
Transfer-Encoding: chunked

2
bo
2
dy
0


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=10 span[header_field]="Connection"
off=29 len=7 span[header_value]="upgrade"
off=38 len=7 span[header_field]="Upgrade"
off=47 len=3 span[header_value]="h2c"
off=52 len=17 span[header_field]="Transfer-Encoding"
off=71 len=7 span[header_value]="chunked"
off=82 headers complete status=200 v=1/1 flags=21c content_length=0
off=85 chunk header len=2
off=85 len=2 span[body]="bo"
off=89 chunk complete
off=92 chunk header len=2
off=92 len=2 span[body]="dy"
off=96 chunk complete
off=99 chunk header len=0
off=101 chunk complete
off=101 message complete
```
