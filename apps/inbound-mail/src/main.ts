// Source is taken from the un-maintained https://github.com/Flolagale/mailin and refactored

import './config';

import mailin from './server/index';
import logger from './server/logger';
import * as Sentry from '@sentry/node';
import { version } from '../package.json';
import { env, validateEnv } from '@novu/application-generic';

const LOG_CONTEXT = 'Main';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: `v${version}`,
  });
}

// Validate the env after Sentry starts, so missing variables are reported to Sentry
validateEnv('inbound-mail');

export default mailin.start(
  {
    port: env.PORT || 25,
    host: env.HOST,
    disableDkim: env.disableDkim,
    disableSpf: env.disableSpf,
    disableSpamScore: env.disableSpamScore,
    verbose: env.verbose,
    debug: env.debug,
    profile: env.profile,
    disableDNSValidation: !env.enableDnsValidation,
    smtpOptions: env.smtpOptions,
  },
  function (err) {
    if (err) process.exit(1);

    if (mailin.configuration.disableDkim) logger.info('Dkim checking is disabled');
    if (mailin.configuration.disableSpf) logger.info('Spf checking is disabled');
    if (mailin.configuration.disableSpamScore) logger.info('Spam score computation is disabled');
  }
);
