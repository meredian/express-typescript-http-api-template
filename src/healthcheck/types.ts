import { Context } from '@/common/context';

type OkResultType = 'OK';
type CheckResultValue = {
  result: OkResultType | string;
  context?: object;
  timeMs: number;
};

export type HealthCheckResult = {
  // OK is a string, but I want it to be clearly separated
  // OK means no error, other value is error message
  checks: {
    [checkName: string]: CheckResultValue;
  };
  isHealthy: boolean;
};

export type CheckDataContext = Record<string, any>;

export type CheckHandler = (
  ctx: Context, // Caller execution context
  context: CheckDataContext, // Actual check context in case you want store some info
) => Promise<void> | void;

export type UnhealthyHandler = (
  result: HealthCheckResult,
) => Promise<void> | void;

export interface HealthcheckProvider {
  checkHealth: CheckHandler;
}

export const OkResult: OkResultType = 'OK';
