module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {},
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['*.ts'],
      // Not for the .env loader (runs before app code) or tests (they write process.env).
      excludedFiles: ['src/config/index.ts', '*.spec.ts', '*.e2e.ts', 'e2e/**'],
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
