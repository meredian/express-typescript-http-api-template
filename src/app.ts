import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import expressPinoLogger from 'express-pino-logger';

import { Config } from '@common/config';
import { Logger } from '@common/logger';
import BaseRouter from '@/http/base-router';
import { Context } from './common/context';
import CreateCtxMiddleware from './http/create-ctx.middleware';
import { ExpressHandler, ExpressErrorHandler } from './http/types';

export default class App {
  private readonly _app: express.Application;

  constructor(
    private readonly _config: Config,
    private readonly _logger: Logger,
  ) {
    this._app = express();
    this.initialiseBeforeMiddleWares();
    if (this._config.isProd === false) {
      this._app.set('json spaces', 2);
    }
  }

  public listen() {
    const port = this._config.port;
    return new Promise(res => {
      this._app.listen(port, () => {
        this._logger.info(`HTTP Server is listening on port ${port}`);
        res(undefined);
      });
    });
  }

  public use(basePath: string, router: BaseRouter): App {
    this._app.use(basePath, router.router);
    return this;
  }

  initialiseBeforeMiddleWares() {
    this._app.use(cors({ origin: true, credentials: true }));
    this._app.use(hpp());
    this._app.use(helmet());
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(
      // req.iq & req.logger later embedded into context
      expressPinoLogger({
        logger: this._logger,
        genReqId: () => Context.createId('request'),
        serializers: {
          req: req => ({
            id: req.id,
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
            remotePort: req.remotePort,
          }),
          res: res => ({
            statusCode: res.statusCode,
          }),
        },
      }),
    );
    this._app.use(new CreateCtxMiddleware(this._logger).handler);
  }

  public useMiddleware(
    ...middlewares: (ExpressHandler | ExpressErrorHandler)[]
  ) {
    this._app.use(...middlewares);
    return this;
  }
}
