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
