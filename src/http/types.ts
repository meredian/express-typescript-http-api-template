import { Context } from '@/common/context';

import { NextFunction, Request, Response } from 'express';

export type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export type ExpressErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export type AsyncHandler = (req: CtxRequest, res: Response) => Promise<any>;

export type AsyncExpressHandler = (
  req: CtxRequest,
  res: Response,
) => Promise<void> | void;

export type AsyncExpressErrorHandler = (
  err: Error,
  req: CtxRequest,
  res: Response,
) => Promise<void | Error> | void | Error;

export interface CtxRequest extends Request {
  ctx: Context;
}
