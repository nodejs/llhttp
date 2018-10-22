Sample requests
===============

Lots of sample requests, most ported from [http_parser][0] test suite.

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

## curl GET

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

## Firefox GET

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

## DUMBPACK

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

## No headers and no body

<!-- meta={"type": "request"} -->
```http
GET /get_no_headers_no_body/world HTTP/1.1


```

```log
off=0 message begin
off=4 len=29 span[url]="/get_no_headers_no_body/world"
off=46 headers complete method=1 v=1/1 flags=0 content_length=0
off=46 message complete
```

## One header and no body

<!-- meta={"type": "request"} -->
```http
GET /get_one_header_no_body HTTP/1.1
Accept: */*


```

```log
off=0 message begin
off=4 len=23 span[url]="/get_one_header_no_body"
off=38 len=6 span[header_field]="Accept"
off=46 len=3 span[header_value]="*/*"
off=53 headers complete method=1 v=1/1 flags=0 content_length=0
off=53 message complete
```

## Apache bench GET

The server receiving this request SHOULD NOT wait for EOF to know that
`Content-Length == 0`.

<!-- meta={"type": "request"} -->
```http
GET /test HTTP/1.0
Host: 0.0.0.0:5000
User-Agent: ApacheBench/2.3
Accept: */*


```

```log
off=0 message begin
off=4 len=5 span[url]="/test"
off=20 len=4 span[header_field]="Host"
off=26 len=12 span[header_value]="0.0.0.0:5000"
off=40 len=10 span[header_field]="User-Agent"
off=52 len=15 span[header_value]="ApacheBench/2.3"
off=69 len=6 span[header_field]="Accept"
off=77 len=3 span[header_value]="*/*"
off=84 headers complete method=1 v=1/0 flags=0 content_length=0
off=84 message complete
```

## Prefix newline

Some clients, especially after a POST in a keep-alive connection,
will send an extra CRLF before the next request.

<!-- meta={"type": "request"} -->
```http
\r\nGET /test HTTP/1.1


```

```log
off=2 message begin
off=6 len=5 span[url]="/test"
off=24 headers complete method=1 v=1/1 flags=0 content_length=0
off=24 message complete
```

## No HTTP version

<!-- meta={"type": "request"} -->
```http
GET /


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=9 headers complete method=1 v=0/9 flags=0 content_length=0
off=9 message complete
```

## Line folding in header value with CRLF

<!-- meta={"type": "request"} -->
```http
GET / HTTP/1.1
Line1:   abc
\tdef
 ghi
\t\tjkl
  mno 
\t \tqrs
Line2: \t line2\t
Line3:
 line3
Line4: 
 
Connection:
 close


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=16 len=5 span[header_field]="Line1"
off=25 len=3 span[header_value]="abc"
off=30 len=4 span[header_value]="\tdef"
off=36 len=4 span[header_value]=" ghi"
off=42 len=5 span[header_value]="\t\tjkl"
off=49 len=6 span[header_value]="  mno "
off=57 len=6 span[header_value]="\t \tqrs"
off=65 len=5 span[header_field]="Line2"
off=74 len=6 span[header_value]="line2\t"
off=82 len=5 span[header_field]="Line3"
off=91 len=5 span[header_value]="line3"
off=98 len=5 span[header_field]="Line4"
off=110 len=0 span[header_value]=""
off=110 len=10 span[header_field]="Connection"
off=124 len=5 span[header_value]="close"
off=133 headers complete method=1 v=1/1 flags=2 content_length=0
off=133 message complete
```

## Line folding in header value with LF

<!-- meta={"type": "request"} -->
```http
GET / HTTP/1.1\n\
Line1:   abc\n\
\tdef\n\
 ghi\n\
\t\tjkl\n\
  mno \n\
\t \tqrs\n\
Line2: \t line2\t\n\
Line3:\n\
 line3\n\
Line4: \n\
 \n\
Connection:\n\
 close\n\
\n
```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=15 len=5 span[header_field]="Line1"
off=24 len=3 span[header_value]="abc"
off=28 len=4 span[header_value]="\tdef"
off=33 len=4 span[header_value]=" ghi"
off=38 len=5 span[header_value]="\t\tjkl"
off=44 len=6 span[header_value]="  mno "
off=51 len=6 span[header_value]="\t \tqrs"
off=58 len=5 span[header_field]="Line2"
off=67 len=6 span[header_value]="line2\t"
off=74 len=5 span[header_field]="Line3"
off=82 len=5 span[header_value]="line3"
off=88 len=5 span[header_field]="Line4"
off=98 len=0 span[header_value]=""
off=98 len=10 span[header_field]="Connection"
off=111 len=5 span[header_value]="close"
off=118 headers complete method=1 v=1/1 flags=2 content_length=0
off=118 message complete
```

## Request starting with CRLF

<!-- meta={"type": "request"} -->
```http
\r\nGET /url HTTP/1.1
Header1: Value1


```

```log
off=2 message begin
off=6 len=4 span[url]="/url"
off=21 len=7 span[header_field]="Header1"
off=30 len=6 span[header_value]="Value1"
off=40 headers complete method=1 v=1/1 flags=0 content_length=0
off=40 message complete
```

[0]: https://github.com/nodejs/http-parser
