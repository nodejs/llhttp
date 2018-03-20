import { LLParse, node as apiNode } from 'llparse';

import Match = apiNode.Match;
import Node = apiNode.Node;

import {
  ALPHA,
  CharList,
  ERROR,
  HTTPMode,
  STRICT_URL_CHAR,
  URL_CHAR,
  USERINFO_CHARS,
} from './constants';

export interface IURLResult {
  readonly entry: {
    readonly normal: Node;
    readonly connect: Node;
  };
  readonly exit: {
    readonly toHTTP: Node;
    readonly toHTTP09: Node;
  };
}

export class URL {
  private readonly errorInvalid: Node;
  private readonly errorStrictInvalid: Node;
  private readonly URL_CHAR: CharList;

  constructor(private readonly llparse: LLParse,
              private readonly mode: HTTPMode = 'loose') {
    const p = this.llparse;

    this.errorInvalid = p.error(ERROR.INVALID_URL, 'Invalid characters in url');
    this.errorStrictInvalid =
      p.error(ERROR.INVALID_URL, 'Invalid characters in url (strict mode)');

    this.URL_CHAR = mode === 'strict' ? STRICT_URL_CHAR : URL_CHAR;
  }

  public build(): IURLResult {
    const p = this.llparse;

    const span = p.span(p.code.span('http_parser__on_url'));

    const entry = {
      connect: this.node('entry_connect'),
      normal: this.node('entry_normal'),
    };

    const start = this.node('start');
    const path = this.node('path');
    const queryOrFragment = this.node('query_or_fragment');
    const schema = this.node('schema');
    const server = this.node('server');
    const queryStart = this.node('query_start');
    const query = this.node('query');
    const fragment = this.node('fragment');
    const serverWithAt = this.node('server_with_at');

    entry.normal
      .otherwise(span.start(start));

    entry.connect
      .otherwise(span.start(server));

    start
      .match([ '/', '*' ], path)
      .match(ALPHA, schema)
      .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected start char in url'));

    schema
      .match(ALPHA, schema)
      .match('://', server)
      .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url schema'));

    [
      server,
      serverWithAt,
    ].forEach((node) => {
      node
        .match('/', path)
        .match('?', query)
        .match(USERINFO_CHARS, server)
        .match([ '[', ']' ], server)
        .otherwise(p.error(ERROR.INVALID_URL, 'Unexpected char in url server'));

      if (node !== serverWithAt) {
        node.match('@', serverWithAt);
      }
    });

    serverWithAt
      .match('@', p.error(ERROR.INVALID_URL, 'Double @ in url'));

    path
      .match(this.URL_CHAR, path)
      .otherwise(queryOrFragment);

    // Performance optimization, split `path` so that the fast case remains
    // there
    queryOrFragment
      .match('?', query)
      .match('#', fragment)
      .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url path'));

    query
      .match(this.URL_CHAR, query)
      // Allow extra '?' in query string
      .match('?', query)
      .match('#', fragment)
      .otherwise(p.error(ERROR.INVALID_URL, 'Invalid char in url query'));

    fragment
      .match(this.URL_CHAR, fragment)
      .match('?', fragment)
      .match('#', fragment)
      .otherwise(
        p.error(ERROR.INVALID_URL, 'Invalid char in url fragment start'));

    [ start, schema ].forEach((node) => {
      /* No whitespace allowed here */
      node.match([ ' ', '\r', '\n' ], this.errorInvalid);
    });

    // Adaptors
    const toHTTP = this.node('to_http');
    const toHTTP09 = this.node('to_http_09');

    const skipToHTTP = this.node('skip_to_http')
      .skipTo(toHTTP);

    const skipToHTTP09 = this.node('skip_to_http09')
      .skipTo(toHTTP09);

    const skipCRLF = this.node('skip_lf_to_http09')
      .match('\r\n', toHTTP09)
      .otherwise(p.error(ERROR.INVALID_URL, 'Expected CRLF'));

    [
      server, serverWithAt, queryOrFragment, queryStart, query,
      fragment,
    ].forEach((node) => {
      node.peek(' ', span.end(skipToHTTP));

      node.peek('\r', span.end(skipCRLF));
      node.peek('\n', span.end(skipToHTTP09));
    });

    return {
      entry,
      exit: {
        toHTTP,
        toHTTP09,
      },
    };
  }

  private node(name: string): Match {
    const res = this.llparse.node('url_' + name);

    if (this.mode === 'strict') {
      res.match([ '\t', '\f' ], this.errorStrictInvalid);
    }

    return res;
  }
}
