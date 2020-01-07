Invalid requests
================

### ICE protocol and GET method

<!-- meta={"type": "request"} -->
```http
GET /music/sweet/music ICE/1.0
Host: example.com


```

```log
off=0 message begin
off=4 len=18 span[url]="/music/sweet/music"
off=27 error code=8 reason="Expected SOURCE method for ICE/x.x request"
```

### ICE protocol, but not really

<!-- meta={"type": "request"} -->
```http
GET /music/sweet/music IHTTP/1.0
Host: example.com


```

```log
off=0 message begin
off=4 len=18 span[url]="/music/sweet/music"
off=24 error code=8 reason="Expected HTTP/"
```

### Headers separated by CR

<!-- meta={"type": "request"} -->
```http
GET / HTTP/1.1
Foo: 1\rBar: 2


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=16 len=3 span[header_field]="Foo"
off=21 len=1 span[header_value]="1"
off=23 error code=3 reason="Missing expected LF after header value"
```

### Invalid header token #1

<!-- meta={"type": "request", "noScan": true} -->
```http
GET / HTTP/1.1
Fo@: Failure


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=18 error code=10 reason="Invalid header token"
```

### Invalid header token #2

<!-- meta={"type": "request", "noScan": true} -->
```http
GET / HTTP/1.1
Foo\01\test: Bar


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=19 error code=10 reason="Invalid header token"
```

### Invalid method

<!-- meta={"type": "request"} -->
```http
MKCOLA / HTTP/1.1


```

```log
off=0 message begin
off=5 error code=6 reason="Expected space after method"
```

### Illegal header field name line folding

<!-- meta={"type": "request", "noScan": true} -->
```http
GET / HTTP/1.1
name
 : value


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=20 error code=10 reason="Invalid header token"
```

### Corrupted Connection header

<!-- meta={"type": "request", "noScan": true} -->
```http
GET / HTTP/1.1
Host: www.example.com
Connection\r\033\065\325eep-Alive
Accept-Encoding: gzip


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=16 len=4 span[header_field]="Host"
off=22 len=15 span[header_value]="www.example.com"
off=49 error code=10 reason="Invalid header token"
```

### Corrupted header name

<!-- meta={"type": "request", "noScan": true} -->
```http
GET / HTTP/1.1
Host: www.example.com
X-Some-Header\r\033\065\325eep-Alive
Accept-Encoding: gzip


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=16 len=4 span[header_field]="Host"
off=22 len=15 span[header_value]="www.example.com"
off=52 error code=10 reason="Invalid header token"
```
