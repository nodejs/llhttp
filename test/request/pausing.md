Pausing
=======

### on_message_begin

<!-- meta={"type": "request", "pause": "on_message_begin"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=0 pause
off=5 len=1 span[url]="/"
off=7 url complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="abc"
off=41 message complete
```

### on_message_complete

<!-- meta={"type": "request", "pause": "on_message_complete"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=7 url complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="abc"
off=41 message complete
off=41 pause
```

### on_url_complete

<!-- meta={"type": "request", "pause": "on_url_complete"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=7 url complete
off=7 pause
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="abc"
off=41 message complete
```

### on_header_field_complete

<!-- meta={"type": "request", "pause": "on_header_field_complete"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=7 url complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=32 pause
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="abc"
off=41 message complete
```

### on_header_value_complete

<!-- meta={"type": "request", "pause": "on_header_value_complete"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=7 url complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=36 pause
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="abc"
off=41 message complete
```

### on_headers_complete

<!-- meta={"type": "request", "pause": "on_headers_complete"} -->
```http
POST / HTTP/1.1
Content-Length: 3

abc
```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=7 url complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete method=3 v=1/1 flags=20 content_length=3
off=38 pause
off=38 len=3 span[body]="abc"
off=41 message complete
```

### on_chunk_header

<!-- meta={"type": "request", "pause": "on_chunk_header"} -->
```http
PUT / HTTP/1.1
Transfer-Encoding: chunked

a
0123456789
0


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=6 url complete
off=16 len=17 span[header_field]="Transfer-Encoding"
off=34 header_field complete
off=35 len=7 span[header_value]="chunked"
off=44 header_value complete
off=46 headers complete method=4 v=1/1 flags=208 content_length=0
off=49 chunk header len=10
off=49 pause
off=49 len=10 span[body]="0123456789"
off=61 chunk complete
off=64 chunk header len=0
off=64 pause
off=66 chunk complete
off=66 message complete
```

### on_chunk_complete

<!-- meta={"type": "request", "pause": "on_chunk_complete"} -->
```http
PUT / HTTP/1.1
Transfer-Encoding: chunked

a
0123456789
0


```

```log
off=0 message begin
off=4 len=1 span[url]="/"
off=6 url complete
off=16 len=17 span[header_field]="Transfer-Encoding"
off=34 header_field complete
off=35 len=7 span[header_value]="chunked"
off=44 header_value complete
off=46 headers complete method=4 v=1/1 flags=208 content_length=0
off=49 chunk header len=10
off=49 len=10 span[body]="0123456789"
off=61 chunk complete
off=61 pause
off=64 chunk header len=0
off=66 chunk complete
off=66 pause
off=66 message complete
```