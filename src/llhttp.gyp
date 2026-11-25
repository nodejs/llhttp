{
  'variables': {
    'llhttp_sources': [
      'src/llhttp.c',
      'src/api.c',
      'src/http.c',
    ]
  },
  'targets': [
    {
      'target_name': 'llhttp',
      'type': 'static_library',
      'include_dirs': [ '.', 'include' ],
      'direct_dependent_settings': {
        'include_dirs': [ 'include' ],
      },
      'sources': [
        '<@(llhttp_sources)',
      ],
      'conditions': [
        # On x86-64, api.c (llhttp_execute) calls llhttp__internal_execute_sse42,
        # a second instantiation of the parser compiled with -msse4.2 and chosen
        # at runtime via __builtin_cpu_supports (see src/native/api.c). It is a
        # separate target so -msse4.2 applies only to that one translation unit.
        # Skipped on MSVC, which has no __builtin_cpu_supports (the dispatch in
        # api.c is then compiled out and the symbol is not referenced).
        ['OS!="win" and (target_arch=="x64" or target_arch=="x86_64")', {
          'dependencies': [ 'llhttp_sse42' ],
        }],
      ],
    },
  ],
  'conditions': [
    ['OS!="win" and (target_arch=="x64" or target_arch=="x86_64")', {
      'targets': [
        {
          'target_name': 'llhttp_sse42',
          'type': 'static_library',
          'include_dirs': [ '.', 'include' ],
          'sources': [ 'src/llhttp_sse42.c' ],
          'cflags': [ '-msse4.2' ],
          'cflags_cc': [ '-msse4.2' ],
          'xcode_settings': {
            'OTHER_CFLAGS': [ '-msse4.2' ],
          },
        },
      ],
    }],
  ],
}
