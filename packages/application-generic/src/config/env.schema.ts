/*
 * THE SINGLE SOURCE OF TRUTH FOR ENVIRONMENT VARIABLES (api, worker, application-generic).
 *
 * Read values with `env.X` from '@novu/application-generic', never `process.env.X` (enforced by lint).
 * `env.X` is typed from this file, so an undeclared variable is a compile error.
 *
 * Add a variable:       add a key below with a `desc`. Optional: `type` ('number' | 'boolean', default string),
 *                       `default`, `choices`, `pattern`, `required` (services that must not boot without it).
 *                       Put fallback values in `default`, not at the call site (`env.X ?? 'fallback'`).
 * Deprecate a variable: add `deprecated: 'Use Y instead.'` and a `@deprecated` JSDoc tag on the key.
 *                       Boot logs a warning while it is still set; editors strike through remaining usages.
 * Remove a variable:    once nothing reads it, delete the key.
 *
 * Each service checks this schema at boot with `validateEnv('<service>')`.
 */
import type { EnvVarSpec } from './env';

const URL_PATTERN = /^https?:\/\/.+/;
const DIGITS_PATTERN = /^\d+$/;
const storageIs =
  (provider: 'AWS' | 'GCS' | 'AZURE') => (rawEnv: NodeJS.ProcessEnv) =>
    (rawEnv.STORAGE_SERVICE || 'AWS') === provider;

export const envSchema = {
  // Runtime
  NODE_ENV: {
    desc: 'Runtime environment.',
    choices: ['dev', 'test', 'production', 'ci', 'local', 'staging'],
  },
  PORT: {
    desc: 'HTTP port the service listens on.',
    type: 'number',
    required: ['api', 'worker'],
  },
  E2E_RUNNER: {
    desc: 'Set by the e2e test runner. Read by the .env loader (src/config/index.ts).',
  },
  MIGRATION: {
    desc: 'Set when running migrations. Read by the .env loader (src/config/index.ts).',
  },
  LAMBDA_TASK_ROOT: {
    desc: 'Set by AWS Lambda. Read by the .env loader, which then tolerates a missing .env file.',
  },

  // URLs
  FRONT_BASE_URL: {
    desc: 'Public URL of the web dashboard. Used in emails, CORS and auth redirects.',
    pattern: URL_PATTERN,
    required: ['api'],
  },
  API_ROOT_URL: {
    desc: 'Public URL of the API. Used to build OAuth callback URLs.',
  },
  WIDGET_BASE_URL: { desc: 'Public URL of the widget, allowed by CORS.' },
  MAIL_SERVER_DOMAIN: { desc: 'Inbound mail domain shown as the MX record.' },

  // Security and auth
  JWT_SECRET: { desc: 'Secret used to sign JWTs.', required: ['api'] },
  STORE_ENCRYPTION_KEY: {
    desc: 'Key used to encrypt stored credentials. Exactly 32 characters.',
    pattern: /^.{32}$/,
    required: ['api', 'worker'],
  },
  DISABLE_USER_REGISTRATION: {
    desc: 'Reject new sign-ups.',
    type: 'boolean',
    default: false,
  },
  GITHUB_OAUTH_CLIENT_ID: {
    desc: 'GitHub OAuth app client ID. Enables GitHub login when set.',
  },
  GITHUB_OAUTH_CLIENT_SECRET: { desc: 'GitHub OAuth app client secret.' },
  INTERCOM_IDENTITY_VERIFICATION_SECRET_KEY: {
    desc: 'Intercom identity verification secret. Enables user hashes when set.',
  },

  // MongoDB
  MONGO_URL: {
    desc: 'MongoDB connection string.',
    required: ['api', 'worker'],
  },
  MONGO_MIN_POOL_SIZE: {
    desc: 'MongoDB min pool size (read by @novu/dal).',
    type: 'number',
    default: 10,
  },
  MONGO_MAX_POOL_SIZE: {
    desc: 'MongoDB max pool size (read by @novu/dal).',
    type: 'number',
    default: 500,
  },

  // Redis: single node (queues, self-hosted)
  REDIS_HOST: { desc: 'Redis host.', required: ['api', 'worker'] },
  REDIS_PORT: {
    desc: 'Redis port.',
    pattern: DIGITS_PATTERN,
    required: ['api', 'worker'],
  },
  REDIS_DB_INDEX: {
    desc: 'Redis database index.',
    pattern: DIGITS_PATTERN,
    required: ['worker'],
  },
  REDIS_PASSWORD: { desc: 'Redis password.' },
  REDIS_TLS: { desc: 'Redis TLS options.' },
  REDIS_TTL: { desc: 'Redis default TTL in seconds.' },
  REDIS_CONNECT_TIMEOUT: { desc: 'Redis connect timeout in ms.' },
  REDIS_KEEP_ALIVE: { desc: 'Redis keep-alive in ms.' },
  REDIS_FAMILY: { desc: 'Redis IP family (4 or 6).' },
  REDIS_PREFIX: { desc: 'Redis key prefix.' },

  // Redis cluster (also used by the ElastiCache provider for its non-host settings)
  REDIS_CLUSTER_SERVICE_HOST: { desc: 'Redis cluster host.' },
  REDIS_CLUSTER_SERVICE_PORTS: {
    desc: 'Redis cluster ports, as a JSON array.',
  },
  REDIS_CLUSTER_TTL: { desc: 'Redis cluster default TTL in seconds.' },
  REDIS_CLUSTER_PASSWORD: { desc: 'Redis cluster password.' },
  REDIS_CLUSTER_CONNECTION_TIMEOUT: {
    desc: 'Redis cluster connect timeout in ms.',
  },
  REDIS_CLUSTER_KEEP_ALIVE: { desc: 'Redis cluster keep-alive in ms.' },
  REDIS_CLUSTER_FAMILY: { desc: 'Redis cluster IP family (4 or 6).' },
  REDIS_CLUSTER_KEY_PREFIX: { desc: 'Redis cluster key prefix.' },
  REDIS_CLUSTER_TLS: { desc: 'Redis cluster TLS options.' },
  REDIS_CACHE_ENABLE_AUTOPIPELINING: {
    desc: 'Cache auto-pipelining. Note: the current code enables it only when this is "false".',
  },
  ELASTICACHE_CLUSTER_SERVICE_HOST: {
    desc: 'ElastiCache cluster host (cache).',
  },
  ELASTICACHE_CLUSTER_SERVICE_PORT: {
    desc: 'ElastiCache cluster port (cache).',
  },

  // MemoryDB cluster (queues on Novu Cloud)
  MEMORY_DB_CLUSTER_SERVICE_HOST: { desc: 'MemoryDB cluster host.' },
  MEMORY_DB_CLUSTER_SERVICE_PORT: { desc: 'MemoryDB cluster port.' },
  MEMORY_DB_CLUSTER_SERVICE_TTL: {
    desc: 'MemoryDB cluster default TTL in seconds.',
  },
  MEMORY_DB_CLUSTER_SERVICE_USERNAME: { desc: 'MemoryDB cluster username.' },
  MEMORY_DB_CLUSTER_SERVICE_PASSWORD: { desc: 'MemoryDB cluster password.' },
  MEMORY_DB_CLUSTER_SERVICE_CONNECTION_TIMEOUT: {
    desc: 'MemoryDB cluster connect timeout in ms.',
  },
  MEMORY_DB_CLUSTER_SERVICE_KEEP_ALIVE: {
    desc: 'MemoryDB cluster keep-alive in ms.',
  },
  MEMORY_DB_CLUSTER_SERVICE_FAMILY: {
    desc: 'MemoryDB cluster IP family (4 or 6).',
  },
  MEMORY_DB_CLUSTER_SERVICE_KEY_PREFIX: {
    desc: 'MemoryDB cluster key prefix.',
  },
  MEMORY_DB_CLUSTER_SERVICE_TLS: { desc: 'MemoryDB cluster TLS options.' },

  // In-memory provider
  IS_IN_MEMORY_CLUSTER_MODE_ENABLED: {
    desc: 'Use the cluster in-memory provider ("true" / "false").',
  },
  /** @deprecated Use IS_IN_MEMORY_CLUSTER_MODE_ENABLED. */
  IN_MEMORY_CLUSTER_MODE_ENABLED: {
    desc: 'Legacy name of IS_IN_MEMORY_CLUSTER_MODE_ENABLED.',
    deprecated: 'Use IS_IN_MEMORY_CLUSTER_MODE_ENABLED instead.',
  },
  IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT: {
    desc: 'Delay in ms between in-memory provider readiness checks.',
    type: 'number',
    default: 100,
  },
  IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT_RETRIES: {
    desc: 'Max in-memory provider readiness checks.',
    type: 'number',
    default: 10,
  },
  /*
   * Legacy: not read by any service, but still set in the .env, docker and kustomize files.
   * Deprecate once those files stop setting them, to avoid warning every self-hosted deployment.
   */
  REDIS_CACHE_SERVICE_HOST: { desc: 'Legacy, unused.' },
  REDIS_CACHE_SERVICE_PORT: { desc: 'Legacy, unused.' },
  REDIS_CACHE_SERVICE_TLS: { desc: 'Legacy, unused.' },
  REDIS_CACHE_PASSWORD: { desc: 'Legacy, unused.' },

  // Storage
  STORAGE_SERVICE: {
    desc: 'File storage provider: AWS (default), GCS or AZURE.',
  },
  CDN_URL: {
    desc: 'Public base URL for stored files. Overrides provider URLs.',
  },
  S3_LOCAL_STACK: { desc: 'S3 endpoint override, e.g. LocalStack.' },
  S3_BUCKET_NAME: { desc: 'S3 bucket.', required: storageIs('AWS') },
  S3_REGION: { desc: 'S3 region.', required: storageIs('AWS') },
  AWS_ACCESS_KEY_ID: {
    desc: 'AWS access key (read by the AWS SDK).',
    required: storageIs('AWS'),
  },
  AWS_SECRET_ACCESS_KEY: {
    desc: 'AWS secret key (read by the AWS SDK).',
    required: storageIs('AWS'),
  },
  GCS_BUCKET_NAME: { desc: 'GCS bucket.', required: storageIs('GCS') },
  GCS_DOMAIN: {
    desc: 'Public GCS domain for file URLs.',
    required: storageIs('GCS'),
  },
  AZURE_ACCOUNT_NAME: {
    desc: 'Azure storage account name.',
    required: storageIs('AZURE'),
  },
  AZURE_ACCOUNT_KEY: {
    desc: 'Azure storage account key.',
    required: storageIs('AZURE'),
  },
  AZURE_HOST_NAME: {
    desc: 'Azure blob host. Defaults to https://<AZURE_ACCOUNT_NAME>.blob.core.windows.net.',
  },
  AZURE_CONTAINER_NAME: { desc: 'Azure blob container.' },

  // Novu Cloud and deployment
  NOVU_MANAGED_SERVICE: {
    desc: 'Set on Novu Cloud. Note: some checks compare to "true", others only check that it is set.',
  },
  IS_DOCKER_HOSTED: {
    desc: 'Set on Docker deployments: use single-node Redis for queues. Any non-empty value counts.',
  },
  CI_EE_TEST: { desc: 'Load enterprise modules in CI when "true".' },
  BLUEPRINT_CREATOR: {
    desc: 'Organization ID that owns the workflow blueprints.',
  },
  HOSTING_PLATFORM: {
    desc: 'Hosting platform, added to logs.',
    default: 'Docker',
  },
  TENANT: { desc: 'Tenant name, added to logs.', default: 'OS' },
  FLEET_NAME: { desc: 'Deployment name for job metrics.', default: 'default' },
  CRON_CHECKING_URL: {
    desc: 'Heartbeat base URL for cron health checks.',
    default: 'https://uptime.betterstack.com/api/v1/heartbeat/',
  },
  ACTIVE_CRON_ID: { desc: 'Heartbeat ID of the active jobs metric cron.' },
  COMPLETED_CRON_ID: {
    desc: 'Heartbeat ID of the completed jobs metric cron.',
  },

  // Observability
  LOGGING_LEVEL: { desc: 'Pino log level.', default: 'info' },
  SENTRY_DSN: { desc: 'Sentry DSN. Enables Sentry when set.' },
  NEW_RELIC_APP_NAME: { desc: 'New Relic app name.' },
  NEW_RELIC_LICENSE_KEY: {
    desc: 'New Relic license key. Enables job metrics on Novu Cloud.',
  },

  // Novu's own notifications (sent by the API to dashboard users)
  NOVU_API_KEY: {
    desc: "Novu API key used to send Novu's own emails (invites, password reset).",
  },
  NOVU_TEMPLATEID_PASSWORD_RESET: {
    desc: 'Workflow ID of the password reset email.',
    default: 'password-reset-llS-wzWMq',
  },
  NOVU_TEMPLATEID_INVITE_TO_ORGANISATION: {
    desc: 'Workflow ID of the organization invite email.',
    default: 'invite-to-organization-wBnO8NpDn',
  },
  NOVU_TEMPLATEID_INVITE_ACCEPTED: {
    desc: 'Workflow ID of the invite accepted email.',
    default: 'invite-accepted-dEQAsKD1E',
  },
  SENDGRID_API_KEY: { desc: 'SendGrid API key for the API mail service.' },

  // Novu demo integrations (free email / SMS providers)
  NOVU_EMAIL_INTEGRATION_API_KEY: {
    desc: 'API key of the Novu demo email provider.',
  },
  NOVU_SMS_INTEGRATION_ACCOUNT_SID: {
    desc: 'Account SID of the Novu demo SMS provider.',
  },
  NOVU_SMS_INTEGRATION_TOKEN: { desc: 'Token of the Novu demo SMS provider.' },
  NOVU_SMS_INTEGRATION_SENDER: {
    desc: 'Sender of the Novu demo SMS provider.',
  },
  MAX_NOVU_INTEGRATION_MAIL_REQUESTS: {
    desc: 'Monthly email limit of the Novu demo provider.',
    type: 'number',
    default: 300,
  },
  MAX_NOVU_INTEGRATION_SMS_REQUESTS: {
    desc: 'Monthly SMS limit of the Novu demo provider.',
    type: 'number',
    default: 20,
  },

  // Vercel integration
  VERCEL_CLIENT_ID: { desc: 'Vercel integration client ID.' },
  VERCEL_CLIENT_SECRET: { desc: 'Vercel integration client secret.' },
  VERCEL_REDIRECT_URI: { desc: 'Vercel integration OAuth redirect URI.' },
  VERCEL_BASE_URL: { desc: 'Vercel API base URL.' },

  // Analytics and feature flags
  SEGMENT_TOKEN: { desc: 'Segment write key. Enables Segment when set.' },
  MIXPANEL_TOKEN: { desc: 'Mixpanel token. Enables Mixpanel when set.' },
  LAUNCH_DARKLY_SDK_KEY: {
    desc: 'LaunchDarkly SDK key. Without it, feature flags use the env fallbacks below.',
  },
  FF_IS_TOPIC_NOTIFICATION_ENABLED: {
    desc: 'Feature flag fallback ("true" / "false").',
  },
  IS_MULTI_PROVIDER_CONFIGURATION_ENABLED: {
    desc: 'Feature flag fallback ("true" / "false").',
  },
  IS_TEMPLATE_STORE_ENABLED: {
    desc: 'Feature flag fallback ("true" / "false").',
  },
  IS_USE_MERGED_DIGEST_ID_ENABLED: {
    desc: 'Feature flag fallback ("true" / "false").',
  },
  STORE_NOTIFICATION_CONTENT: {
    desc: 'Store rendered content of non in-app messages when "true".',
  },
} as const satisfies Record<string, EnvVarSpec>;
