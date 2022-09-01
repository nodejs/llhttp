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
off=493 len=1 span[body]=lf
off=494 len=14 span[body]="</BODY></HTML>"
```

## amazon.com

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 301 MovedPermanently
Date: Wed, 15 May 2013 17:06:33 GMT
Server: Server
x-amz-id-1: 0GPHKXSJQ826RK7GZEB2
p3p: policyref="http://www.amazon.com/w3c/p3p.xml",CP="CAO DSP LAW CUR ADM IVAo IVDo CONo OTPo OUR DELi PUBi OTRi BUS PHY ONL UNI PUR FIN COM NAV INT DEM CNT STA HEA PRE LOC GOV OTC "
x-amz-id-2: STN69VZxIFSz9YJLbz1GDbxpbjG6Qjmmq5E3DxRhOUw+Et0p4hr7c/Q8qNcx4oAD
Location: http://www.amazon.com/Dan-Brown/e/B000AP9DSU/ref=s9_pop_gw_al1?_encoding=UTF8&refinementId=618073011&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=center-2&pf_rd_r=0SHYY5BZXN3KR20BNFAY&pf_rd_t=101&pf_rd_p=1263340922&pf_rd_i=507846
Vary: Accept-Encoding,User-Agent
Content-Type: text/html; charset=ISO-8859-1
Transfer-Encoding: chunked

1
\n
0


```

```log
off=0 message begin
off=13 len=16 span[status]="MovedPermanently"
off=31 len=4 span[header_field]="Date"
off=37 len=29 span[header_value]="Wed, 15 May 2013 17:06:33 GMT"
off=68 len=6 span[header_field]="Server"
off=76 len=6 span[header_value]="Server"
off=84 len=10 span[header_field]="x-amz-id-1"
off=96 len=20 span[header_value]="0GPHKXSJQ826RK7GZEB2"
off=118 len=3 span[header_field]="p3p"
off=123 len=178 span[header_value]="policyref="http://www.amazon.com/w3c/p3p.xml",CP="CAO DSP LAW CUR ADM IVAo IVDo CONo OTPo OUR DELi PUBi OTRi BUS PHY ONL UNI PUR FIN COM NAV INT DEM CNT STA HEA PRE LOC GOV OTC ""
off=303 len=10 span[header_field]="x-amz-id-2"
off=315 len=64 span[header_value]="STN69VZxIFSz9YJLbz1GDbxpbjG6Qjmmq5E3DxRhOUw+Et0p4hr7c/Q8qNcx4oAD"
off=381 len=8 span[header_field]="Location"
off=391 len=214 span[header_value]="http://www.amazon.com/Dan-Brown/e/B000AP9DSU/ref=s9_pop_gw_al1?_encoding=UTF8&refinementId=618073011&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=center-2&pf_rd_r=0SHYY5BZXN3KR20BNFAY&pf_rd_t=101&pf_rd_p=1263340922&pf_rd_i=507846"
off=607 len=4 span[header_field]="Vary"
off=613 len=26 span[header_value]="Accept-Encoding,User-Agent"
off=641 len=12 span[header_field]="Content-Type"
off=655 len=29 span[header_value]="text/html; charset=ISO-8859-1"
off=686 len=17 span[header_field]="Transfer-Encoding"
off=705 len=7 span[header_value]="chunked"
off=716 headers complete status=301 v=1/1 flags=208 content_length=0
off=719 chunk header len=1
off=719 len=1 span[body]=lf
off=722 chunk complete
off=725 chunk header len=0
off=727 chunk complete
off=727 message complete
```

## No headers and no body

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 404 Not Found


```

```log
off=0 message begin
off=13 len=9 span[status]="Not Found"
off=26 headers complete status=404 v=1/1 flags=0 content_length=0
```

## No reason phrase

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 301


```

```log
off=0 message begin
off=16 headers complete status=301 v=1/1 flags=0 content_length=0
```

## Empty reason phrase after space

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 \r\n\


```

```log
off=0 message begin
off=17 headers complete status=200 v=1/1 flags=0 content_length=0
```

## No carriage ret

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK\n\
Content-Type: text/html; charset=utf-8\n\
Connection: close\n\
\n\
these headers are from http://news.ycombinator.com/
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=16 len=12 span[header_field]="Content-Type"
off=30 len=24 span[header_value]="text/html; charset=utf-8"
off=55 error code=25 reason="Missing expected CR after header value"
```

## Underscore in header key

Shown by: `curl -o /dev/null -v "http://ad.doubleclick.net/pfadx/DARTSHELLCONFIGXML;dcmt=text/xml;"`

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Server: DCLK-AdSvr
Content-Type: text/xml
Content-Length: 0
DCLK_imp: v7;x;114750856;0-0;0;17820020;0/0;21603567/21621457/1;;~okv=;dcmt=text/xml;;~cs=o


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=6 span[header_field]="Server"
off=25 len=10 span[header_value]="DCLK-AdSvr"
off=37 len=12 span[header_field]="Content-Type"
off=51 len=8 span[header_value]="text/xml"
off=61 len=14 span[header_field]="Content-Length"
off=77 len=1 span[header_value]="0"
off=80 len=8 span[header_field]="DCLK_imp"
off=90 len=81 span[header_value]="v7;x;114750856;0-0;0;17820020;0/0;21603567/21621457/1;;~okv=;dcmt=text/xml;;~cs=o"
off=175 headers complete status=200 v=1/1 flags=20 content_length=0
off=175 message complete
```

## bonjourmadame.fr

The client should not merge two headers fields when the first one doesn't
have a value.

<!-- meta={"type": "response"} -->
```http
HTTP/1.0 301 Moved Permanently
Date: Thu, 03 Jun 2010 09:56:32 GMT
Server: Apache/2.2.3 (Red Hat)
Cache-Control: public
Pragma: \r\n\
Location: http://www.bonjourmadame.fr/
Vary: Accept-Encoding
Content-Length: 0
Content-Type: text/html; charset=UTF-8
Connection: keep-alive


```

```log
off=0 message begin
off=13 len=17 span[status]="Moved Permanently"
off=32 len=4 span[header_field]="Date"
off=38 len=29 span[header_value]="Thu, 03 Jun 2010 09:56:32 GMT"
off=69 len=6 span[header_field]="Server"
off=77 len=22 span[header_value]="Apache/2.2.3 (Red Hat)"
off=101 len=13 span[header_field]="Cache-Control"
off=116 len=6 span[header_value]="public"
off=124 len=6 span[header_field]="Pragma"
off=134 len=0 span[header_value]=""
off=134 len=8 span[header_field]="Location"
off=144 len=28 span[header_value]="http://www.bonjourmadame.fr/"
off=174 len=4 span[header_field]="Vary"
off=180 len=15 span[header_value]="Accept-Encoding"
off=197 len=14 span[header_field]="Content-Length"
off=213 len=1 span[header_value]="0"
off=216 len=12 span[header_field]="Content-Type"
off=230 len=24 span[header_value]="text/html; charset=UTF-8"
off=256 len=10 span[header_field]="Connection"
off=268 len=10 span[header_value]="keep-alive"
off=282 headers complete status=301 v=1/0 flags=21 content_length=0
off=282 message complete
```

## Spaces in header value

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Date: Tue, 28 Sep 2010 01:14:13 GMT
Server: Apache
Cache-Control: no-cache, must-revalidate
Expires: Mon, 26 Jul 1997 05:00:00 GMT
.et-Cookie: PlaxoCS=1274804622353690521; path=/; domain=.plaxo.com
Vary: Accept-Encoding
_eep-Alive: timeout=45
_onnection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: text/html
Connection: close

0


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=4 span[header_field]="Date"
off=23 len=29 span[header_value]="Tue, 28 Sep 2010 01:14:13 GMT"
off=54 len=6 span[header_field]="Server"
off=62 len=6 span[header_value]="Apache"
off=70 len=13 span[header_field]="Cache-Control"
off=85 len=25 span[header_value]="no-cache, must-revalidate"
off=112 len=7 span[header_field]="Expires"
off=121 len=29 span[header_value]="Mon, 26 Jul 1997 05:00:00 GMT"
off=152 len=10 span[header_field]=".et-Cookie"
off=164 len=54 span[header_value]="PlaxoCS=1274804622353690521; path=/; domain=.plaxo.com"
off=220 len=4 span[header_field]="Vary"
off=226 len=15 span[header_value]="Accept-Encoding"
off=243 len=10 span[header_field]="_eep-Alive"
off=255 len=10 span[header_value]="timeout=45"
off=267 len=10 span[header_field]="_onnection"
off=279 len=10 span[header_value]="Keep-Alive"
off=291 len=17 span[header_field]="Transfer-Encoding"
off=310 len=7 span[header_value]="chunked"
off=319 len=12 span[header_field]="Content-Type"
off=333 len=9 span[header_value]="text/html"
off=344 len=10 span[header_field]="Connection"
off=356 len=5 span[header_value]="close"
off=365 headers complete status=200 v=1/1 flags=20a content_length=0
off=368 chunk header len=0
off=370 chunk complete
off=370 message complete
```

## Spaces in header name in strict mode

<!-- meta={"type": "response", "mode": "strict", "noScan": true} -->
```http
HTTP/1.1 200 OK
Server: Microsoft-IIS/6.0
X-Powered-By: ASP.NET
en-US Content-Type: text/xml
Content-Type: text/xml
Content-Length: 16
Date: Fri, 23 Jul 2010 18:45:38 GMT
Connection: keep-alive

<xml>hello</xml>
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=6 span[header_field]="Server"
off=25 len=17 span[header_value]="Microsoft-IIS/6.0"
off=44 len=12 span[header_field]="X-Powered-By"
off=58 len=7 span[header_value]="ASP.NET"
off=72 error code=10 reason="Invalid header token"
```

## Spaces in header name in loose mode

`en-US Content-Type` must be treated as a header name

<!-- meta={"type": "response", "mode": "loose"} -->
```http
HTTP/1.1 200 OK
Server: Microsoft-IIS/6.0
X-Powered-By: ASP.NET
en-US Content-Type: text/xml
Content-Type: text/xml
Content-Length: 16
Date: Fri, 23 Jul 2010 18:45:38 GMT
Connection: keep-alive

<xml>hello</xml>
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=6 span[header_field]="Server"
off=25 len=17 span[header_value]="Microsoft-IIS/6.0"
off=44 len=12 span[header_field]="X-Powered-By"
off=58 len=7 span[header_value]="ASP.NET"
off=67 len=18 span[header_field]="en-US Content-Type"
off=87 len=8 span[header_value]="text/xml"
off=97 len=12 span[header_field]="Content-Type"
off=111 len=8 span[header_value]="text/xml"
off=121 len=14 span[header_field]="Content-Length"
off=137 len=2 span[header_value]="16"
off=141 len=4 span[header_field]="Date"
off=147 len=29 span[header_value]="Fri, 23 Jul 2010 18:45:38 GMT"
off=178 len=10 span[header_field]="Connection"
off=190 len=10 span[header_value]="keep-alive"
off=204 headers complete status=200 v=1/1 flags=21 content_length=16
off=204 len=16 span[body]="<xml>hello</xml>"
off=220 message complete
```

## Non ASCII in status line

<!-- meta={"type": "response", "noScan": true} -->
```http
HTTP/1.1 500 Oriëntatieprobleem
Date: Fri, 5 Nov 2010 23:07:12 GMT+2
Content-Length: 0
Connection: close


```

```log
off=0 message begin
off=13 len=19 span[status]="Oriëntatieprobleem"
off=34 len=4 span[header_field]="Date"
off=40 len=30 span[header_value]="Fri, 5 Nov 2010 23:07:12 GMT+2"
off=72 len=14 span[header_field]="Content-Length"
off=88 len=1 span[header_value]="0"
off=91 len=10 span[header_field]="Connection"
off=103 len=5 span[header_value]="close"
off=112 headers complete status=500 v=1/1 flags=22 content_length=0
off=112 message complete
```

## HTTP version 0.9

<!-- meta={"type": "response"} -->
```http
HTTP/0.9 200 OK


```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=19 headers complete status=200 v=0/9 flags=0 content_length=0
```

## No Content-Length, no Transfer-Encoding

The client should wait for the server's EOF. That is, when neither
content-length nor transfer-encoding is specified, the end of body
is specified by the EOF.

<!-- meta={"type": "response"} -->
```http
HTTP/1.1 200 OK
Content-Type: text/plain

hello world
```

```log
off=0 message begin
off=13 len=2 span[status]="OK"
off=17 len=12 span[header_field]="Content-Type"
off=31 len=10 span[header_value]="text/plain"
off=45 headers complete status=200 v=1/1 flags=0 content_length=0
off=45 len=11 span[body]="hello world"
```

## Response starting with CRLF

<!-- meta={"type": "response"} -->
```http
\r\nHTTP/1.1 200 OK
Header1: Value1
Header2:\t Value2
Content-Length: 0


```

```log
off=2 message begin
off=15 len=2 span[status]="OK"
off=19 len=7 span[header_field]="Header1"
off=28 len=6 span[header_value]="Value1"
off=36 len=7 span[header_field]="Header2"
off=46 len=6 span[header_value]="Value2"
off=54 len=14 span[header_field]="Content-Length"
off=70 len=1 span[header_value]="0"
off=75 headers complete status=200 v=1/1 flags=20 content_length=0
off=75 message complete
```
