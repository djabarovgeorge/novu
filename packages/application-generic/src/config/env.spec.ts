import { Logger } from '@nestjs/common';

import { env, validateEnv } from './env';

const VALID_ENV = {
  PORT: '3000',
  FRONT_BASE_URL: 'http://localhost:4200',
  JWT_SECRET: 'secret',
  STORE_ENCRYPTION_KEY: 'a'.repeat(32),
  MONGO_URL: 'mongodb://localhost',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  REDIS_DB_INDEX: '2',
  STORAGE_SERVICE: 'GCS',
  GCS_BUCKET_NAME: 'bucket',
  GCS_DOMAIN: 'https://storage.googleapis.com',
};

describe('env', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('reads the current process.env value on every access', () => {
    process.env.SENTRY_DSN = 'first';
    expect(env.SENTRY_DSN).toBe('first');

    process.env.SENTRY_DSN = 'second';
    expect(env.SENTRY_DSN).toBe('second');
  });

  it('applies defaults to unset and empty values', () => {
    delete process.env.SENTRY_DSN;
    process.env.FLEET_NAME = '';
    process.env.MAX_NOVU_INTEGRATION_MAIL_REQUESTS = '';

    expect(env.SENTRY_DSN).toBeUndefined();
    expect(env.FLEET_NAME).toBe('default');
    expect(env.MAX_NOVU_INTEGRATION_MAIL_REQUESTS).toBe(300);
  });

  it('passes empty plain strings through like process.env', () => {
    process.env.REDIS_CLUSTER_PASSWORD = '';

    expect(env.REDIS_CLUSTER_PASSWORD).toBe('');
  });

  it('parses numbers and booleans', () => {
    process.env.PORT = '3000';
    process.env.DISABLE_USER_REGISTRATION = 'true';

    expect(env.PORT).toBe(3000);
    expect(env.DISABLE_USER_REGISTRATION).toBe(true);
  });

  it('throws on malformed values without echoing them', () => {
    process.env.PORT = 'not-a-port';

    expect(() => env.PORT).toThrow('PORT must be a number');
    expect(() => env.PORT).not.toThrow(/not-a-port/);
  });

  it('is read-only', () => {
    expect(() => {
      (env as { PORT: number }).PORT = 1;
    }).toThrow();
  });
});

describe('validateEnv', () => {
  it('accepts a valid environment', () => {
    expect(() => validateEnv('api', VALID_ENV)).not.toThrow();
    expect(() => validateEnv('worker', VALID_ENV)).not.toThrow();
  });

  it('requires variables only for the services that list them', () => {
    const { JWT_SECRET, REDIS_DB_INDEX, ...rest } = VALID_ENV;

    expect(() => validateEnv('api', rest)).toThrow('JWT_SECRET is required');
    expect(() => validateEnv('worker', rest)).toThrow(
      'REDIS_DB_INDEX is required'
    );
  });

  it('supports conditional requirements', () => {
    const { STORAGE_SERVICE, ...awsByDefault } = VALID_ENV;

    expect(() => validateEnv('api', awsByDefault)).toThrow(
      'S3_BUCKET_NAME is required'
    );
  });

  it('does not require storage for services without file storage', () => {
    const minimal = {
      PORT: '3002',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      JWT_SECRET: 'secret',
    };

    expect(() => validateEnv('ws', minimal)).not.toThrow();
    expect(() => validateEnv('webhook', { PORT: '3003' })).not.toThrow();
    expect(() => validateEnv('inbound-mail', {})).not.toThrow();
    expect(() => validateEnv('ws', { PORT: '3002' })).toThrow(
      'JWT_SECRET is required'
    );
  });

  it('reports every problem at once without echoing values', () => {
    const run = () =>
      validateEnv('api', {
        ...VALID_ENV,
        NODE_ENV: 'prod',
        STORE_ENCRYPTION_KEY: 'too-short',
        MONGO_URL: '',
      });

    expect(run).toThrow(/NODE_ENV must be one of/);
    expect(run).toThrow(/STORE_ENCRYPTION_KEY must match/);
    expect(run).toThrow(/MONGO_URL is required/);
    expect(run).not.toThrow(/too-short/);
  });

  it('warns about deprecated variables that are set', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation();

    validateEnv('api', {
      ...VALID_ENV,
      IN_MEMORY_CLUSTER_MODE_ENABLED: 'true',
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('IN_MEMORY_CLUSTER_MODE_ENABLED is deprecated'),
      'Env'
    );
    warn.mockRestore();
  });
});
