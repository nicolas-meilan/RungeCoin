/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [...fixupConfigRules(
  compat.extends('@react-native', 'plugin:import/recommended', 'airbnb-typescript'),
), {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',

    parserOptions: {
      project: './tsconfig.json',
    },
  },
  rules: {
    'react/jsx-filename-extension': ['warn', {
      extensions: ['.js', '.ts', '.tsx'],
    }],
    'import/default': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unstable-nested-components': 'off',
    'import/namespace': 'off',
    'import/no-named-as-default': 'off',
    curly: 'off',
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': 'off',
    semi: 'off',

    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'semi',
        requireLast: true,
      },

      singleline: {
        delimiter: 'semi',
        requireLast: false,
      },
    }],

    '@typescript-eslint/semi': ['error'],
    'react/style-prop-object': 'off',

    'import/order': ['error', {
      groups: ['builtin', 'external'],

      pathGroups: [{
        pattern: 'react',
        group: 'builtin',
      }, {
        pattern: 'react-native',
        group: 'builtin',
      }, {
        pattern: '@screens/**',
        group: 'internal',
      }, {
        pattern: '@components/**',
        group: 'internal',
      }, {
        pattern: '@containers/**',
        group: 'internal',
      }, {
        pattern: '@hooks/**',
        group: 'internal',
      }, {
        pattern: '@navigation/**',
        group: 'internal',
      }, {
        pattern: '@system/**',
        group: 'internal',
      }, {
        pattern: '@http/**',
        group: 'internal',
      }, {
        pattern: '@utils/**',
        group: 'internal',
      }, {
        pattern: '@web3/**',
        group: 'internal',
      }, {
        pattern: '@assets/**',
        group: 'internal',
      }],

      pathGroupsExcludedImportTypes: [],

      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },

      'newlines-between': 'always',
    }],

    'react/jsx-indent': ['error', 2],
    '@typescript-eslint/indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/type-annotation-spacing': 'error',

    'no-restricted-imports': ['error', {
      paths: [{
        name: 'react-native',
        importNames: ['Text'],
        message: "Please import it from '@atoms/Text' instead.",
      }, {
        name: 'react-native',
        importNames: ['TextInput'],
        message: "Please import it from '@atoms/TextInput' instead.",
      }],
    }],
  },
}];
