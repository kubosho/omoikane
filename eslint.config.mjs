import config from '@kubosho/configs/eslint';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...config,
  globalIgnores(['.next/**', 'build/**', 'next-env.d.ts', 'out/**']),
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx'],
    extends: [storybook.configs['flat/recommended']],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/.storybook/**/*.ts', '**/*.config.*', '**/*.stories.*', '**/*.test.*'],
        },
      ],
    },
  },
]);
