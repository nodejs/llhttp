# URL tests

## Absolute URL

```url
http://example.com/path?query=value#schema
```

```log
off=0 len=4 span[url.schema]="http"
off=7 len=11 span[url.host]="example.com"
off=18 len=5 span[url.path]="/path"
off=24 len=11 span[url.query]="query=value"
off=36 len=6 span[url.fragment]="schema"
```

## Relative URL

```url
/path?query=value#schema
```

```log
off=0 len=5 span[url.path]="/path"
off=6 len=11 span[url.query]="query=value"
off=18 len=6 span[url.fragment]="schema"
```

## Failing on broken schema

<!-- meta={"noScan": true} -->
```url
schema:/path?query=value#schema
```

```log
off=0 len=6 span[url.schema]="schema"
off=8 error code=7 reason="Unexpected char in url schema"
```
