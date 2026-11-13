Relaxed host header
===================

Relaxed host header mode: accepts multiple host headers
this is meant to stop redirection or injection attacks 
and other unusual behaviors.

## multiple host headers (relaxed)
When HOST_HEADER is not set, it should allow multiple hosts to be set.

<!-- meta={"type": "request"} -->

```http
GET / HTTP/1.1
host: www.python.org
host: llhttp.org


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
off=19 len=4 span[header_field] = "host"
off=24 len=10 span[header_value] = "www.python.org"
off=35 len=4 span[header_field] = "host"
off=40 len=10 span[header_field] = "llhttp.org"
```


## Invalid Hosts (strict)

HOST_HEADER if enabled this will not allow multiple headers to be set.

<!-- meta={"type": "request-lenient-host-header"} -->

```http
GET /url HTTP/1.1
host: www.python.org
host: llhttp.org


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
off=19 len=4 span[header_field] = "host"
off=24 len=10 span[header_value] = "www.python.org"
off=19 len=4 error code=40
```
