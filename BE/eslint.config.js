const parser = require('@typescript-eslint/parser');
const eslintPlugin = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-plugin-prettier');
const unusedImports = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    // Thay thế .eslintignore
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/src/models/**',
      '**/src/migrations/**',
      '**/src/app.ts',
    ],
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
      prettier,
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      'prettier/prettier': 'error',
      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
      ],

      'import/order': [
        'error',
        {
          warnOnUnassignedImports: true,
          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            'index',
            'parent',
            'sibling',
            ['type', 'object'],
          ],
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '**/*.repository',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      semi: ['error', 'always'],
    },
  },
];
