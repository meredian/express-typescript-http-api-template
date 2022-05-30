import { StatusCodes } from 'http-status-codes';
import { isHttpError } from 'http-errors';

export class DomainError extends Error {
  toHttpError(statusCode: StatusCodes, expose = true) {
    return toHttpError(this, statusCode, expose);
  }
}

export const toHttpError = (
  err: Error,
  statusCode: StatusCodes,
  expose = true,
):
  | Error
  | { statusCode: StatusCodes; status: StatusCodes; expose: boolean } => {
  if (isHttpError(err)) {
    return err;
  }
  return Object.assign(err, {
    statusCode: statusCode,
    status: statusCode,
    expose,
  }) as Error;
};
