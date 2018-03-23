# URL tests

## Absolute URL

```url
http://example.com/path?query=value#schema
```

```log
off=0 len=42 span[url]="http://example.com/path?query=value#schema"
```

## Relative URL

```url
/path?query=value#schema
```

```log
off=0 len=24 span[url]="/path?query=value#schema"
```

## Failing on broken schema

<!-- meta={"noScan": true} -->
```url
schema:/path?query=value#schema
```

```log
off=8 error code=7 reason="Unexpected char in url schema"
```
