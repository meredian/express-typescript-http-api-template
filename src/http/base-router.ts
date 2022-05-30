import { NextFunction, Request, Response, Router } from 'express';
import { BaseErrorMiddleware, BaseMiddleware } from './base-middleware';
import {
  AsyncHandler,
  CtxRequest,
  ExpressErrorHandler,
  ExpressHandler,
} from './types';

const asyncToExpressHandler = (handler: AsyncHandler): ExpressHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req as CtxRequest, res);
      if (result === undefined) {
        throw new Error(`Undefined passed for serialisation from ${req.id}`);
      }
      if (!res.headersSent) {
        res.status(200);
      }
      if (!res.writableEnded) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

export default class BaseRouter {
  public router = Router();

  get(path: string, handler: AsyncHandler): void {
    this.router.get(path, asyncToExpressHandler(handler));
  }

  post(path: string, handler: AsyncHandler): void {
    this.router.post(path, asyncToExpressHandler(handler));
  }

  put(path: string, handler: AsyncHandler): void {
    this.router.put(path, asyncToExpressHandler(handler));
  }

  delete(path: string, handler: AsyncHandler): void {
    this.router.delete(path, asyncToExpressHandler(handler));
  }

  useMiddleware(
    middleware:
      | ExpressHandler
      | ExpressErrorHandler
      | BaseMiddleware
      | BaseErrorMiddleware,
  ): void {
    if (
      middleware instanceof BaseMiddleware ||
      middleware instanceof BaseErrorMiddleware
    ) {
      this.router.use(middleware.handler);
    } else {
      this.router.use(middleware);
    }
  }
}
