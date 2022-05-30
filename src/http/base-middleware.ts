import { NextFunction, Request, Response } from 'express';
import {
  AsyncExpressErrorHandler,
  AsyncExpressHandler,
  CtxRequest,
  ExpressErrorHandler,
  ExpressHandler,
} from './types';

const asyncToExpressHandler = (
  handler: AsyncExpressHandler,
): ExpressHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as CtxRequest, res);
      next();
    } catch (error) {
      next(error);
    }
  };
};

const asyncToExpressErrorHandler = (
  handler: AsyncExpressErrorHandler,
): ExpressErrorHandler => {
  return async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const newErr = await handler(err, req as CtxRequest, res);
      next(newErr);
    } catch (error) {
      next(error);
    }
  };
};

export class BaseMiddleware {
  public handler: ExpressHandler;

  constructor(handler: AsyncExpressHandler) {
    this.handler = asyncToExpressHandler(handler);
  }
}

export class BaseErrorMiddleware {
  public handler: ExpressErrorHandler;

  constructor(handler: AsyncExpressErrorHandler) {
    this.handler = asyncToExpressErrorHandler(handler);
  }
}
