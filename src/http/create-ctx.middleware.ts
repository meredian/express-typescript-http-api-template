import { Context } from '@/common/context';
import { Logger } from '@/common/logger';
import { BaseMiddleware } from './base-middleware';
import { CtxRequest } from './types';

export default class CreateCtxMiddleware extends BaseMiddleware {
  constructor(logger: Logger) {
    super(async (req: CtxRequest) => {
      req.ctx = new Context(req.id as string, logger);
    });
  }
}
