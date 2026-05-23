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
      // Non-null assertions are used intentionally for known-safe array access
      // (e.g. palette[0] when palette is statically non-empty).
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Prefer `type` over `interface` for consistency — unions and intersections
      // come up often, and mixing the two is more confusing than picking one.
      '@typescript-eslint/consistent-type-definitions': 'off',
      // Leading underscore marks intentionally-unused params (e.g. `_vbW` in
      // SVG helpers that all share a signature for symmetry).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
)
