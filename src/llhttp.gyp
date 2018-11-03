# This file is used with the GYP meta build system.
# http://code.google.com/p/gyp/
# To build try this:
#   svn co http://gyp.googlecode.com/svn/trunk gyp
#   ./gyp/gyp -f make --depth=`pwd` llhttp.gyp 
#   ./out/Debug/test 
{
  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      # TODO: hoist these out and put them somewhere common, because
      #       RuntimeLibrary MUST MATCH across the entire project
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'cflags': [ '-Wall', '-Wextra', '-O0', '-g', '-ftrapv' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'cflags': [ '-Wall', '-Wextra', '-O3' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCCLCompilerTool': {
      },
      'VCLibrarianTool': {
      },
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },
    'conditions': [
      ['OS == "win"', {
        'defines': [
          'WIN32'
        ],
      }]
    ],
  },

  'targets': [
    {
      'target_name': 'llhttp',
      'type': 'static_library',
      'include_dirs': [ '.', 'src' ],
      'direct_dependent_settings': {
        'include_dirs': [ '.' ],
      },
      'sources': [ 'src/llhttp.c', 'src/api.c', 'src/http.c' ],
      'conditions': [
        ['OS=="win"', {
          'msvs_settings': {
            'VCCLCompilerTool': {
              # Compile as C++. llhttp.c is actually C99, but C++ is
              # close enough in this case.
              'CompileAs': 2,
            },
          },
        }]
      ],
    },
  ]
}
