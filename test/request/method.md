Methods
=======

### REPORT request

<!-- meta={"type": "request"} -->
```http
REPORT /test HTTP/1.1


```

```log
off=0 message begin
off=0 len=6 span[method]="REPORT"
off=7 len=5 span[url]="/test"
off=13 len=4 span[protocol]="HTTP"
off=25 headers complete v=1/1 flags=0 content_length=0
off=25 message complete
```

### CONNECT request

<!-- meta={"type": "request"} -->
```http
CONNECT 0-home0.netscape.com:443 HTTP/1.0
User-agent: Mozilla/1.1N
Proxy-authorization: basic aGVsbG86d29ybGQ=

some data
and yet even more data
```

```log
off=0 message begin
off=0 len=7 span[method]="CONNECT"
off=8 len=24 span[url]="0-home0.netscape.com:443"
off=33 len=4 span[protocol]="HTTP"
off=43 len=10 span[header_field]="User-agent"
off=55 len=12 span[header_value]="Mozilla/1.1N"
off=69 len=19 span[header_field]="Proxy-authorization"
off=90 len=22 span[header_value]="basic aGVsbG86d29ybGQ="
off=116 headers complete v=1/0 flags=400 content_length=0
off=116 message complete
off=116 error code=22 reason="Pause on CONNECT/Upgrade"
```

### CONNECT request with CAPS

<!-- meta={"type": "request"} -->
```http
CONNECT HOME0.NETSCAPE.COM:443 HTTP/1.0
User-agent: Mozilla/1.1N
Proxy-authorization: basic aGVsbG86d29ybGQ=


```

```log
off=0 message begin
off=0 len=7 span[method]="CONNECT"
off=8 len=22 span[url]="HOME0.NETSCAPE.COM:443"
off=31 len=4 span[protocol]="HTTP"
off=41 len=10 span[header_field]="User-agent"
off=53 len=12 span[header_value]="Mozilla/1.1N"
off=67 len=19 span[header_field]="Proxy-authorization"
off=88 len=22 span[header_value]="basic aGVsbG86d29ybGQ="
off=114 headers complete v=1/0 flags=400 content_length=0
off=114 message complete
off=114 error code=22 reason="Pause on CONNECT/Upgrade"
```

### CONNECT with body

<!-- meta={"type": "request"} -->
```http
CONNECT foo.bar.com:443 HTTP/1.0
User-agent: Mozilla/1.1N
Proxy-authorization: basic aGVsbG86d29ybGQ=
Content-Length: 10

blarfcicle"
```

```log
off=0 message begin
off=0 len=7 span[method]="CONNECT"
off=8 len=15 span[url]="foo.bar.com:443"
off=24 len=4 span[protocol]="HTTP"
off=34 len=10 span[header_field]="User-agent"
off=46 len=12 span[header_value]="Mozilla/1.1N"
off=60 len=19 span[header_field]="Proxy-authorization"
off=81 len=22 span[header_value]="basic aGVsbG86d29ybGQ="
off=105 len=14 span[header_field]="Content-Length"
off=121 len=2 span[header_value]="10"
off=127 headers complete v=1/0 flags=420 content_length=10
off=127 message complete
off=127 error code=22 reason="Pause on CONNECT/Upgrade"
```

### Not a CONNECT request

<!-- meta={"type": "request"} -->
```http
CONNECTION 0-home0.netscape.com:443 HTTP/1.0
User-agent: Mozilla/1.1N


```

```log
off=0 message begin
off=0 len=10 span[method]="CONNECTION"
off=11 error code=7 reason="Unexpected start char in url"
```

### Not a CONNECT request with valid url

<!-- meta={"type": "request"} -->
```http
CONNECTION /url HTTP/1.0
User-agent: Mozilla/1.1N


```

```log
off=0 message begin
off=0 len=10 span[method]="CONNECTION"
off=11 len=4 span[url]="/url"
off=16 len=4 span[protocol]="HTTP"
off=26 len=10 span[header_field]="User-agent"
off=38 len=12 span[header_value]="Mozilla/1.1N"
off=54 headers complete v=1/0 flags=0 content_length=0
off=54 message complete
```

### M-SEARCH request

<!-- meta={"type": "request"} -->
```http
M-SEARCH * HTTP/1.1
HOST: 239.255.255.250:1900
MAN: "ssdp:discover"
ST: "ssdp:all"


```

```log
off=0 message begin
off=0 len=8 span[method]="M-SEARCH"
off=9 len=1 span[url]="*"
off=11 len=4 span[protocol]="HTTP"
off=21 len=4 span[header_field]="HOST"
off=27 len=20 span[header_value]="239.255.255.250:1900"
off=49 len=3 span[header_field]="MAN"
off=54 len=15 span[header_value]=""ssdp:discover""
off=71 len=2 span[header_field]="ST"
off=75 len=10 span[header_value]=""ssdp:all""
off=89 headers complete v=1/1 flags=0 content_length=0
off=89 message complete
```

### PATCH request

<!-- meta={"type": "request"} -->
```http
PATCH /file.txt HTTP/1.1
Host: www.example.com
Content-Type: application/example
If-Match: "e0023aa4e"
Content-Length: 10

cccccccccc
```

```log
off=0 message begin
off=0 len=5 span[method]="PATCH"
off=6 len=9 span[url]="/file.txt"
off=16 len=4 span[protocol]="HTTP"
off=26 len=4 span[header_field]="Host"
off=32 len=15 span[header_value]="www.example.com"
off=49 len=12 span[header_field]="Content-Type"
off=63 len=19 span[header_value]="application/example"
off=84 len=8 span[header_field]="If-Match"
off=94 len=11 span[header_value]=""e0023aa4e""
off=107 len=14 span[header_field]="Content-Length"
off=123 len=2 span[header_value]="10"
off=129 headers complete v=1/1 flags=20 content_length=10
off=129 len=10 span[body]="cccccccccc"
off=139 message complete
```

### PURGE request

<!-- meta={"type": "request"} -->
```http
PURGE /file.txt HTTP/1.1
Host: www.example.com


```

```log
off=0 message begin
off=0 len=5 span[method]="PURGE"
off=6 len=9 span[url]="/file.txt"
off=16 len=4 span[protocol]="HTTP"
off=26 len=4 span[header_field]="Host"
off=32 len=15 span[header_value]="www.example.com"
off=51 headers complete v=1/1 flags=0 content_length=0
off=51 message complete
```

### SEARCH request

<!-- meta={"type": "request"} -->
```http
SEARCH / HTTP/1.1
Host: www.example.com


```

```log
off=0 message begin
off=0 len=6 span[method]="SEARCH"
off=7 len=1 span[url]="/"
off=9 len=4 span[protocol]="HTTP"
off=19 len=4 span[header_field]="Host"
off=25 len=15 span[header_value]="www.example.com"
off=44 headers complete v=1/1 flags=0 content_length=0
off=44 message complete
```

### LINK request

<!-- meta={"type": "request"} -->
```http
LINK /images/my_dog.jpg HTTP/1.1
Host: example.com
Link: <http://example.com/profiles/joe>; rel="tag"
Link: <http://example.com/profiles/sally>; rel="tag"


```

```log
off=0 message begin
off=0 len=4 span[method]="LINK"
off=5 len=18 span[url]="/images/my_dog.jpg"
off=24 len=4 span[protocol]="HTTP"
off=34 len=4 span[header_field]="Host"
off=40 len=11 span[header_value]="example.com"
off=53 len=4 span[header_field]="Link"
off=59 len=44 span[header_value]="<http://example.com/profiles/joe>; rel="tag""
off=105 len=4 span[header_field]="Link"
off=111 len=46 span[header_value]="<http://example.com/profiles/sally>; rel="tag""
off=161 headers complete v=1/1 flags=0 content_length=0
off=161 message complete
```

### LINK request

<!-- meta={"type": "request"} -->
```http
UNLINK /images/my_dog.jpg HTTP/1.1
Host: example.com
Link: <http://example.com/profiles/sally>; rel="tag"


```

```log
off=0 message begin
off=0 len=6 span[method]="UNLINK"
off=7 len=18 span[url]="/images/my_dog.jpg"
off=26 len=4 span[protocol]="HTTP"
off=36 len=4 span[header_field]="Host"
off=42 len=11 span[header_value]="example.com"
off=55 len=4 span[header_field]="Link"
off=61 len=46 span[header_value]="<http://example.com/profiles/sally>; rel="tag""
off=111 headers complete v=1/1 flags=0 content_length=0
off=111 message complete
```

### SOURCE request

<!-- meta={"type": "request"} -->
```http
SOURCE /music/sweet/music HTTP/1.1
Host: example.com


```

```log
off=0 message begin
off=0 len=6 span[method]="SOURCE"
off=7 len=18 span[url]="/music/sweet/music"
off=26 len=4 span[protocol]="HTTP"
off=36 len=4 span[header_field]="Host"
off=42 len=11 span[header_value]="example.com"
off=57 headers complete v=1/1 flags=0 content_length=0
off=57 message complete
```

### SOURCE request with ICE

<!-- meta={"type": "request"} -->
```http
SOURCE /music/sweet/music ICE/1.0
Host: example.com


```

```log
off=0 message begin
off=0 len=6 span[method]="SOURCE"
off=7 len=18 span[url]="/music/sweet/music"
off=26 len=3 span[protocol]="ICE"
off=35 len=4 span[header_field]="Host"
off=41 len=11 span[header_value]="example.com"
off=56 headers complete v=1/0 flags=0 content_length=0
off=56 message complete
```

### Custom method

<!-- meta={"type": "request"} -->
```http
MKCOLA / HTTP/1.1


```

```log
off=0 message begin
off=0 len=6 span[method]="MKCOLA"
off=7 len=1 span[url]="/"
off=9 len=4 span[protocol]="HTTP"
off=21 headers complete v=1/1 flags=0 content_length=0
off=21 message complete
```
