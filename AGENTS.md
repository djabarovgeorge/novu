# Agent guide

## Environment variables (api, worker, application-generic)

- **Read** with `import { env } from '@novu/application-generic'` (inside application-generic: from `src/config`), then `env.MY_VAR`. Never `process.env.MY_VAR`: lint rejects it.
- **Declare** every variable in `packages/application-generic/src/config/env.schema.ts` with a `desc`. `env.X` is typed from that file, so an undeclared variable does not compile.
  - Put fallbacks in `default`, not at the call site (`env.X ?? 'fallback'`).
  - Use `type: 'number' | 'boolean'` instead of parsing at the call site.
  - Use `required: ['api']` (or a predicate) when a service cannot run without it.
  - Add it to the matching `.example.env` files.
- **Deprecate** with `deprecated: 'Use NEW_VAR instead.'` plus a `/** @deprecated */` JSDoc on the key. Boot warns while it is still set, and editors strike through usages. Delete the key once nothing reads it.
- **Validate**: each service calls `validateEnv('<service>')` once at boot. It reports every missing or invalid variable in one error.
- **Tests** set values with `process.env.X = '...'`; `env.X` reads them live.
- After editing the schema, rebuild application-generic (`pnpm --filter @novu/application-generic build`) before typechecking api or worker.
