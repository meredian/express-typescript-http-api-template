import pino, { Bindings } from 'pino';

// We can extend logger context with any extra payload
export type ChildLoggerContext = Bindings;

export type Logger = pino.Logger;
export const buildLogger = pino;
export default buildLogger;
