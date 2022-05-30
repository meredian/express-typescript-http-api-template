import { cleanEnv, port, str, num } from 'envalid';
import { Logger } from './logger';

interface ProcessEnv {
  [key: string]: string | undefined;
}

const buildCleanEnv = (logger: Logger, inputEnv: ProcessEnv) => {
  return cleanEnv(
    inputEnv,
    {
      // NODE_ENV=development is for local/stagings
      // NODE_ENV=production triggers all kind of internal node optimisations
      NODE_ENV: str({ choices: ['development', 'production'] }),
      ENV: str({ default: 'local' }),
      PORT: port({ devDefault: 3000 }),
      HEALTHCHECK_PORT: port({ devDefault: 3001 }),
      HEALTHCHECK_TIMEOUT: num({ devDefault: 30000 }),
    },
    {
      reporter: ({ errors }) => {
        if (Object.keys(errors).length > 1) {
          logger.fatal({ errors }, 'Failed to load config from env');
          process.exit(1);
        }
      },
    },
  );
};

export const buildConfig = (logger: Logger, inputEnv: ProcessEnv) => {
  const env = buildCleanEnv(logger, inputEnv);

  return {
    isProd: env.isProd,
    isDev: env.isDev,
    nodeEnv: env.NODE_ENV,
    env: env.ENV,
    port: env.PORT,
    healthcheck: {
      port: env.HEALTHCHECK_PORT,
      timeout: env.HEALTHCHECK_TIMEOUT,
    },
  };
};

export type Config = ReturnType<typeof buildConfig>;

export default buildConfig;
