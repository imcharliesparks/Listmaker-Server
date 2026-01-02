const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const nodePlugin = require('eslint-plugin-n');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/temp/**',
      'eslint.config.cjs',
      'eslint.config.js',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/public/**',
      'config.js',
      'config.ts',
      'vitest.config.*',
      'scripts/**/*.js',
      'tests/**/*.js',
    ],
  },
  eslint.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Relaxed rules for server/runtime code
      'no-console': 'off',
      'max-len': 'off',
      'n/no-process-env': 'off',
      'n/no-process-exit': 'off',
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-extra-boolean-cast': 'off',
    },
  },
];
