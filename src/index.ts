import dotenv from 'dotenv';

import { buildConfig } from '@common/config';
import { buildLogger } from '@common/logger';
import App from './app';

import HealthcheckService from './healthcheck/healthcheck.service';
import HealthcheckRouter from './healthcheck/healthcheck.router';

import errorMiddleware from './http/errors.middleware';

// Makes to load .env file into process.env
dotenv.config();

const logger = buildLogger();

(async () => {
  const config = buildConfig(logger, process.env);
  logger.info('Initialising dependencies');

  // Healthcheck module
  const healthcheckService = new HealthcheckService(config);

  const app = new App(config, logger)
    .use('/health', new HealthcheckRouter(healthcheckService))
    .useMiddleware(errorMiddleware);

  await app.listen();
})().catch((err: Error) => {
  logger.fatal(err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'uncaughtException');
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  logger.fatal({ err }, 'unhandledRejection');
  process.exit(1);
});

process.on('SIGINT', function () {
  // TODO: Add graceul shutdown
  logger.info('SIGINT received, interrupting...');
  process.exit(0);
});
