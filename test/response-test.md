# LLHTTP responses

## Simple response

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Header1: Value1
Header2:\t Value2
Content-Length: 0


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=7 span[header_field]="Header1"
off=26 len=6 span[header_value]="Value1"
off=34 len=7 span[header_field]="Header2"
off=44 len=6 span[header_value]="Value2"
off=52 len=14 span[header_field]="Content-Length"
off=68 len=1 span[header_value]="0"
off=73 headers complete status=200 v=1/1 flags=20 content_length=0
off=73 message complete
```

## Error on invalid response start

Every response must start with `HTTP/`.

<!-- meta={"type": "response-only"} -->
```http
HTTPER/1.1 200 OK


```

```log
off=0 message begin
off=4 error code=8 reason="Expected HTTP/"
```

## Empty body should not trigger spurious span callbacks

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=19 headers complete status=200 v=1/1 flags=0 content_length=0
```
