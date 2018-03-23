Sample responses
================

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

## Google 301

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 301 Moved Permanently
Location: http://www.google.com/
Content-Type: text/html; charset=UTF-8
Date: Sun, 26 Apr 2009 11:11:49 GMT
Expires: Tue, 26 May 2009 11:11:49 GMT
X-$PrototypeBI-Version: 1.6.0.3
Cache-Control: public, max-age=2592000
Server: gws
Content-Length:  219  

<HTML><HEAD><meta http-equiv=content-type content=text/html;charset=utf-8>\n\
<TITLE>301 Moved</TITLE></HEAD><BODY>\n\
<H1>301 Moved</H1>\n\
The document has moved\n\
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```
_(Note the `$` char in header field)_

```log
off=0 message begin
off=13 len=17 span[status]="Moved Permanently"
off=32 len=8 span[header_field]="Location"
off=42 len=22 span[header_value]="http://www.google.com/"
off=66 len=12 span[header_field]="Content-Type"
off=80 len=24 span[header_value]="text/html; charset=UTF-8"
off=106 len=4 span[header_field]="Date"
off=112 len=29 span[header_value]="Sun, 26 Apr 2009 11:11:49 GMT"
off=143 len=7 span[header_field]="Expires"
off=152 len=29 span[header_value]="Tue, 26 May 2009 11:11:49 GMT"
off=183 len=22 span[header_field]="X-$PrototypeBI-Version"
off=207 len=7 span[header_value]="1.6.0.3"
off=216 len=13 span[header_field]="Cache-Control"
off=231 len=23 span[header_value]="public, max-age=2592000"
off=256 len=6 span[header_field]="Server"
off=264 len=3 span[header_value]="gws"
off=269 len=14 span[header_field]="Content-Length"
off=286 len=5 span[header_value]="219  "
off=295 headers complete status=301 v=1/1 flags=20 content_length=219
off=295 len=74 span[body]="<HTML><HEAD><meta http-equiv=content-type content=text/html;charset=utf-8>"
off=369 len=1 span[body]=lf
off=370 len=37 span[body]="<TITLE>301 Moved</TITLE></HEAD><BODY>"
off=407 len=1 span[body]=lf
off=408 len=18 span[body]="<H1>301 Moved</H1>"
off=426 len=1 span[body]=lf
off=427 len=22 span[body]="The document has moved"
off=449 len=1 span[body]=lf
off=450 len=42 span[body]="<A HREF="http://www.google.com/">here</A>."
off=492 len=1 span[body]=cr
off=493 len=0 span[body]=""
off=493 len=1 span[body]=lf
off=494 len=14 span[body]="</BODY></HTML>"
```
