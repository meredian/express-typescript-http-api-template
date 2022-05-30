import { isHttpError } from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (isHttpError(err)) {
      if (err.status >= 500) {
        req.log.error({ err }, 'Server HTTP Error');
      } else if (err.status >= 400) {
        // Full debug with stack - in case it's needed. Disabled by default
        req.log.warn({ err }, 'Client HTTP Error ');
      }

      res.status(err.status).json({
        id: req.id,
        time: new Date().toISOString(),
        error_message: err.expose ? err.message : getReasonPhrase(err.status),
      });
    } else {
      // Uncasted error! This shouldn't happen. Also we append status:500 so that it's traced
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const error = Object.assign(err, { status }) as Error & {
        status: number;
      };
      req.log.error({ err: error }, 'Unexpected Server Error');
      res.status(status).json({
        id: req.id,
        time: new Date().toISOString(),
        error_message: getReasonPhrase(status),
      });
      next();
    }
  } catch (error) {
    req.log.fatal({ err: error, trigger_err: err }, 'Error handler failed');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      id: req.id,
      time: new Date().toISOString(),
      error_message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    });
    next();
  }
};

export default errorMiddleware;
