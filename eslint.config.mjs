import stylisticJs from '@stylistic/eslint-plugin-js'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ["build", "lib", "examples", "bench"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    "languageOptions": {
      "parser": tseslint.parser,
      "parserOptions": {
        "lib": ["es2023"],
        "module": "commonjs",
        "moduleResolution": "node",
        "target": "es2022",
    
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "include": [
          "bin/**/*.ts",
          "src/**/*.ts",
          "test/**/*.ts"
        ],
        "outDir": "./lib",
        "declaration": true,
        "pretty": true,
        "sourceMap": true
      },
      "globals": {
        ...globals.commonjs,
        ...globals.node,
        ...globals.es6
      },
    },
  },
  {
    plugins: {
      '@stylistic/js': stylisticJs
    },
    files: [
      "bin/**/*.ts",
      'bench/**/*.ts',
      'src/**/*.ts',
      'test/**/*.ts',
    ],
    rules: {
    '@stylistic/js/max-len': [ 2, {
      'code': 120,
      'ignoreComments': true
    } ],
      "@stylistic/js/array-bracket-spacing": ["error", "always"],
      "@stylistic/js/operator-linebreak": ["error", "after"],
      "@stylistic/js/linebreak-style": ["error", "unix"],
      "@stylistic/js/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      '@stylistic/js/indent': ["error", 2, {
        "SwitchCase": 1,
        "FunctionDeclaration":  { "parameters": "first" },
        "FunctionExpression": { "parameters": "first" }
      }],
    }
  }
);
