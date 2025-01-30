import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import * as parser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parser: parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  },
  eslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      react: pluginReact,
      prettier: prettierPlugin,
    },
    rules: tseslint.configs.recommended.rules,
  },
];
