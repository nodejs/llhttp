Pipelining
==========

## Should parse multiple events

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Content-Length: 3

AAA
HTTP/1.1 201 Created
Content-Length: 4

BBBB
HTTP/1.1 202 Accepted
Content-Length: 5

CCCC
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 status complete
off=17 len=14 span[header_field]="Content-Length"
off=32 header_field complete
off=33 len=1 span[header_value]="3"
off=36 header_value complete
off=38 headers complete status=200 v=1/1 flags=20 content_length=3
off=38 len=3 span[body]="AAA"
off=41 message complete
off=43 reset
off=43 message begin
off=56 len=7 span[status]="Created"
off=65 status complete
off=65 len=14 span[header_field]="Content-Length"
off=80 header_field complete
off=81 len=1 span[header_value]="4"
off=84 header_value complete
off=86 headers complete status=201 v=1/1 flags=20 content_length=4
off=86 len=4 span[body]="BBBB"
off=90 message complete
off=92 reset
off=92 message begin
off=105 len=8 span[status]="Accepted"
off=115 status complete
off=115 len=14 span[header_field]="Content-Length"
off=130 header_field complete
off=131 len=1 span[header_value]="5"
off=134 header_value complete
off=136 headers complete status=202 v=1/1 flags=20 content_length=5
off=136 len=4 span[body]="CCCC"
```