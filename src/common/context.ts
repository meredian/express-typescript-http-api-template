import id from './id';
import { Logger, ChildLoggerContext } from './logger';

export type ContextType = 'request';

export class Context {
  private readonly _id: string;
  private readonly _logger: Logger;
  constructor(id: string, logger: Logger) {
    this._id = id;
    this._logger = logger.child({ id });
  }

  get id(): string {
    return this._id;
  }

  get log(): Logger {
    return this._logger;
  }

  child(loggerContext: ChildLoggerContext): Context {
    return new Context(this._id, this._logger.child(loggerContext));
  }

  static createFromType(type: ContextType, logger: Logger) {
    return new Context(Context.createId(type), logger);
  }

  static createId(type: ContextType) {
    return id(type);
  }
}
