Transfer-Encoding header
========================

## Trailing space on chunked body

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

25  \r\n\
This is the data in the first chunk

1C
and this is the second one

0  \r\n\


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 status complete
off=17 len=12 span[header_field]="Content-Type"
off=30 header_field complete
off=31 len=10 span[header_value]="text/plain"
off=43 header_value complete
off=43 len=17 span[header_field]="Transfer-Encoding"
off=61 header_field complete
off=62 len=7 span[header_value]="chunked"
off=71 header_value complete
off=73 headers complete status=200 v=1/1 flags=208 content_length=0
off=79 chunk header len=37
off=79 len=35 span[body]="This is the data in the first chunk"
off=114 len=1 span[body]=cr
off=115 len=1 span[body]=lf
off=118 chunk complete
off=122 chunk header len=28
off=122 len=26 span[body]="and this is the second one"
off=148 len=1 span[body]=cr
off=149 len=1 span[body]=lf
off=152 chunk complete
off=157 chunk header len=0
off=159 chunk complete
off=159 message complete
```

## `chunked` before other transfer-coding

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Accept: */*
Transfer-Encoding: chunked, deflate

World
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 status complete
off=17 len=6 span[header_field]="Accept"
off=24 header_field complete
off=25 len=3 span[header_value]="*/*"
off=30 header_value complete
off=30 len=17 span[header_field]="Transfer-Encoding"
off=48 header_field complete
off=49 len=16 span[header_value]="chunked, deflate"
off=67 header_value complete
off=69 headers complete status=200 v=1/1 flags=200 content_length=0
off=69 len=5 span[body]="World"
```
