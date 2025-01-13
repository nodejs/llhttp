import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  { 
    ignores: ["build", "lib", "examples", "bench", "eslint.config.mjs"] 
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      },
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    files: ["bin/**/*.ts", "bench/**/*.ts", "src/**/*.ts", "test/**/*.ts"],
    rules: {
      "@stylistic/max-len": [
        2,
        {
          code: 120,
          ignoreComments: true,
        },
      ],
      "@stylistic/array-bracket-spacing": ["error", "always"],
      "@stylistic/operator-linebreak": ["error", "after"],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/indent": [
        "error",
        2,
        {
          SwitchCase: 1,
          FunctionDeclaration: { parameters: "first" },
          FunctionExpression: { parameters: "first" },
        },
      ],
    },
  }
);
