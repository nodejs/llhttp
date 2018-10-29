Invalid requests
================

### Spaces in Content-Length

<!-- meta={"type": "request"} -->
```http
POST / HTTP/1.1
Content-Length: 4 2


```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=17 len=14 span[header_field]="Content-Length"
off=33 len=2 span[header_value]="4 "
off=35 error code=11 reason="Invalid character in Content-Length"
```

### Spaces in Content-Length #2

<!-- meta={"type": "request"} -->
```http
POST / HTTP/1.1
Content-Length: 13 37


```

```log
off=0 message begin
off=5 len=1 span[url]="/"
off=17 len=14 span[header_field]="Content-Length"
off=33 len=3 span[header_value]="13 "
off=36 error code=11 reason="Invalid character in Content-Length"
```

### ICE protocol and GET method

<!-- meta={"type": "request"} -->
```http
GET /music/sweet/music ICE/1.0
Host: example.com


```

```log
off=0 message begin
off=4 len=18 span[url]="/music/sweet/music"
off=27 error code=8 reason="Expected SOURCE method for ICE/x.x request"
```
