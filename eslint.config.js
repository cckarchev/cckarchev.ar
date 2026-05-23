import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public', '.husky'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Enforce `type` over `interface` for consistency. Many of our object
      // shapes are unions/intersections that can only be expressed as `type`;
      // mixing the two for plain shapes adds confusion with no benefit.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // Leading underscore marks intentionally-unused params (e.g. `_vbW` in
      // SVG helpers that all share a signature for symmetry).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
)
