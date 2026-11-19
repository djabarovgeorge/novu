module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    'func-names': 'off',
  },
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: '*.spec.ts',
  overrides: [
    {
      files: ['*.ts'],
      // Not for the .env loader / APM config (they run before app code), the env module itself, or tests (they write process.env).
      excludedFiles: ['src/config/index.ts', 'src/newrelic.ts', '*.spec.ts', '*.e2e.ts', '*.e2e-ee.ts', 'e2e/**'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: "MemberExpression[object.name='process'][property.name='env']",
            message:
              "Use `env` from '@novu/application-generic' (typed and validated). Declare new variables in packages/application-generic/src/config/env.schema.ts.",
          },
        ],
      },
    },
  ],
};
