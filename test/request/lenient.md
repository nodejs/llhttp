Lenient header value parsing
============================

Parsing with header value token checks off.

## Header value with lenient

<!-- meta={"type": "request-lenient"} -->
```http
GET /url HTTP/1.1
Header1: \f


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=7 span[header_field]="Header1"
off=28 len=1 span[header_value]="\f"
off=33 headers complete method=1 v=1/1 flags=100 content_length=0
off=33 message complete
```

## Second request header value with lenient

<!-- meta={"type": "request-lenient"} -->
```http
GET /url HTTP/1.1
Header1: Okay


GET /url HTTP/1.1
Header1: \f


```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=7 span[header_field]="Header1"
off=28 len=4 span[header_value]="Okay"
off=36 headers complete method=1 v=1/1 flags=100 content_length=0
off=36 message complete
off=38 message begin
off=42 len=4 span[url]="/url"
off=57 len=7 span[header_field]="Header1"
off=66 len=1 span[header_value]="\f"
off=71 headers complete method=1 v=1/1 flags=100 content_length=0
off=71 message complete
```

## Header value without lenient

<!-- meta={"type": "request"} -->
```http
GET /url HTTP/1.1
Header1: \f



```

```log
off=0 message begin
off=4 len=4 span[url]="/url"
off=19 len=7 span[header_field]="Header1"
off=28 error code=10 reason="Invalid header value char"
```
