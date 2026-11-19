import { Logger } from '@nestjs/common';

import { envSchema } from './env.schema';

/** Services that call `validateEnv` at boot. Extend when another service adopts it. */
export type NovuService = 'api' | 'worker' | 'ws' | 'webhook' | 'inbound-mail';

type RawEnv = NodeJS.ProcessEnv;

interface IEnvVarBase {
  /** What the variable controls. Shown in validation errors. */
  desc: string;
  /**
   * Refuse to boot when the variable is unset or empty.
   * A list of services, or a predicate over the raw env and service for conditional requirements.
   * A list also makes the typed value non-optional.
   */
  required?:
    | readonly NovuService[]
    | ((rawEnv: RawEnv, service: NovuService) => boolean);
  /**
   * Migration hint, e.g. 'Use FOO instead.'. Setting the variable logs a warning at boot.
   * Also add a `@deprecated` JSDoc tag on the key so editors strike through usages.
   */
  deprecated?: string;
}

export type EnvVarSpec =
  | (IEnvVarBase & {
      type?: 'string';
      default?: string;
      choices?: readonly string[];
      pattern?: RegExp;
    })
  | (IEnvVarBase & { type: 'number'; default?: number })
  | (IEnvVarBase & { type: 'boolean'; default?: boolean });

type Schema = typeof envSchema;
type ValueOf<S> = S extends { type: 'number' }
  ? number
  : S extends { type: 'boolean' }
  ? boolean
  : S extends { choices: readonly (infer C)[] }
  ? C
  : string;
type AlwaysSet<S> = S extends { default: unknown }
  ? true
  : S extends { required: readonly unknown[] }
  ? true
  : false;

export type EnvKey = keyof Schema;
export type Env = {
  readonly [K in EnvKey]: AlwaysSet<Schema[K]> extends true
    ? ValueOf<Schema[K]>
    : ValueOf<Schema[K]> | undefined;
};

const specs = envSchema as Record<EnvKey, EnvVarSpec>;

/*
 * Values are never echoed in errors: they may be secrets.
 * An empty string counts as unset, except for plain strings without a default,
 * which return '' exactly like process.env.
 */
function parse(key: string, spec: EnvVarSpec, raw: string | undefined) {
  if (raw === undefined) return spec.default;
  if (raw === '') {
    const isPlainString = !spec.type || spec.type === 'string';

    return isPlainString && spec.default === undefined ? '' : spec.default;
  }

  if (spec.type === 'number') {
    const value = Number(raw);
    if (Number.isNaN(value)) throw new Error(`${key} must be a number`);

    return value;
  }

  if (spec.type === 'boolean') {
    if (raw !== 'true' && raw !== 'false') {
      throw new Error(`${key} must be "true" or "false"`);
    }

    return raw === 'true';
  }

  if (spec.choices && !spec.choices.includes(raw)) {
    throw new Error(`${key} must be one of: ${spec.choices.join(', ')}`);
  }
  if (spec.pattern && !spec.pattern.test(raw)) {
    throw new Error(`${key} must match ${spec.pattern}`);
  }

  return raw;
}

/**
 * Typed, read-only access to every environment variable declared in `env.schema.ts`.
 * Each read parses the current `process.env` value, so tests can still set `process.env.X`.
 *
 * @example
 * import { env } from '@novu/application-generic';
 * app.listen(env.PORT);
 */
export const env: Env = Object.freeze(
  Object.keys(specs).reduce(
    (acc, key) =>
      Object.defineProperty(acc, key, {
        get: () => parse(key, specs[key as EnvKey], process.env[key]),
      }),
    {} as Env
  )
);

/**
 * Validate the environment once at service boot: reports every missing required
 * or malformed variable in one error, and warns about deprecated ones that are set.
 */
export function validateEnv(
  service: NovuService,
  rawEnv: RawEnv = process.env
) {
  const errors: string[] = [];

  for (const [key, spec] of Object.entries(specs)) {
    const raw = rawEnv[key];

    if (raw === undefined || raw === '') {
      const { required } = spec;
      const isRequired =
        typeof required === 'function'
          ? required(rawEnv, service)
          : !!required?.includes(service);

      if (isRequired) errors.push(`${key} is required: ${spec.desc}`);
      continue;
    }

    if (spec.deprecated) {
      Logger.warn(`${key} is deprecated. ${spec.deprecated}`, 'Env');
    }

    try {
      parse(key, spec, raw);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  if (errors.length) {
    throw new Error(
      `Invalid environment variables for ${service}:\n- ${errors.join('\n- ')}`
    );
  }
}
