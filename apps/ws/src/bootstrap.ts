import './config';
import 'newrelic';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { RedisIoAdapter } from './shared/framework/redis.adapter';

import { AppModule } from './app.module';
import { CONTEXT_PATH } from './config';
import helmet from 'helmet';
import { BullMqService, env, validateEnv } from '@novu/application-generic';
import { version } from '../package.json';
import { getErrorInterceptor, Logger } from '@novu/application-generic';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: `v${version}`,
  });
}

// Validate the env after Sentry starts, so missing variables are reported to Sentry
validateEnv('ws');

export async function bootstrap() {
  BullMqService.haveProInstalled();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const redisIoAdapter = new RedisIoAdapter(app);

  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.useGlobalInterceptors(getErrorInterceptor());

  app.setGlobalPrefix(CONTEXT_PATH);

  app.use(helmet());

  app.enableCors({
    origin: '*',
    preflightContinue: false,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(env.PORT);
}
