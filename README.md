# llhttp
[![Build Status](https://secure.travis-ci.org/indutny/llhttp.svg)](http://travis-ci.org/indutny/llhttp)
[![NPM version](https://badge.fury.io/js/llhttp.svg)](https://badge.fury.io/js/llhttp)

Port of [http_parser][0] to [llparse][1].

**NOTE: Only trunk and upcoming 6.0.1 version of clang are supported at the
moment**

## Why?

Let's face it, [http_parser][0] is practically unmaintainable. Even
introduction of a single new method results in a significant code churn.

This project aims to:

* Make it maintainable
* Verifiable
* Improving benchmarks where possible

## How?

Over time, different approaches for improving [http_parser][0]'s code base
were tried. However, all of them failed due to resulting significant performance
degradation. Most of this degradation comes from the extensive [spilling][2]
that is inevitable for such large function as `http_parser_execute`.

Splitting the big switch statement into small functions naively should work,
but, in practice, is feasible only through using a dispatch loop in `execute`,
which is slow due to lots of failed branch predictions. Dispatch loop can be
avoided by use of [tail calls][3], which cannot be guaranteed in C language.

To overcome this impediment, this project utilizes [llparse][1] for converting
the switch statement into [LLVM bitcode][4]. Small functions for each separate
state of the parser are created and linked together through [`musttail`][5]
calls.

The end result of such process is a binary bitcode file, that could be compiled
to machine code with [clang][6] compiler.

## Peformance

So far llhttp outperforms http_parser:

|             | input size |  bandwidth  |  time   |
|:------------|-----------:|------------:|:--------|
| llhttp      | 8192.00 mb | 886.66 mb/s | 9.24 s  |
| http_parser | 8192.00 mb | 605.06 mb/s | 13.54 s |

## Maintenance

llhttp project has less 1000 LoC (lines of code), while the same code in
[http_parser][0] is implemented in approximately 2000 LoC. All optimizations
and multi-character matching in llhttp is generated automatically, and thus
doesn't and any maintenance cost at all.

## Verification

The state machine graph is encoded explicitly in llhttp.

WIP.

#### LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2018.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://github.com/nodejs/http-parser
[1]: https://github.com/indutny/llparse
[2]: https://en.wikipedia.org/wiki/Register_allocation#Spilling
[3]: https://en.wikipedia.org/wiki/Tail_call
[4]: https://llvm.org/docs/LangRef.html
[5]: https://llvm.org/docs/LangRef.html#call-instruction
[6]: https://clang.llvm.org/
