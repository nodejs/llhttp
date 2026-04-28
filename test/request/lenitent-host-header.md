Relaxed host header
===================

Relaxed host header mode: accepts multiple host headers
this is meant to stop redirection or injection attacks 
and other unusual behaviors.

## multiple host headers (relaxed)
HOST_HEADER if set should allow multiple hosts to be set.

<!-- meta={"type": "request_lenient_host_header_relaxed"} -->

```http
GET /url HTTP/1.1
host: www.python.org
host: llhttp.org

```


## Multiple Host

HOST_HEADER if disabled should not allow multiple headers to be set.

```http
GET /url HTTP/1.1
host: www.python.org
host: llhttp.org

```

