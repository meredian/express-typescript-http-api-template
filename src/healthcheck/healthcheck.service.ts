import { resolve } from 'dns';
import { promisify } from 'util';

import { mapValues, find, isEmpty } from 'lodash';

import {
  UnhealthyHandler,
  HealthcheckProvider,
  HealthCheckResult,
  OkResult,
  CheckHandler,
  CheckDataContext,
} from './types';

import { URL } from 'url';
import { Config } from '@/common/config';
import { Context } from '@/common/context';

const resolveAsync = promisify(resolve);

// Some Promise-related helpers
const delay = (delayMs: number) => new Promise(res => setTimeout(res, delayMs));

const props = async <T>(
  obj: Record<string, Promise<T>>,
): Promise<Record<string, T>> => {
  const promises = Object.keys(obj).map(async key => ({
    key,
    value: await obj[key],
  }));
  const results = await Promise.all(promises);
  return results.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, T>);
};

export default class HealthcheckService {
  private readonly _checkHandlers: { [checkName: string]: CheckHandler } = {};
  _unhealthyHandler?: UnhealthyHandler;
  _timeoutMs?: number;

  constructor(private readonly _config: Config) {
    this._timeoutMs = this._config.healthcheck.timeout;
  }

  setTimeout(timeoutMs: number): HealthcheckService {
    this._timeoutMs = timeoutMs;
    return this;
  }

  addCheck(name: string, handler: CheckHandler): HealthcheckService {
    if (this._checkHandlers[name]) {
      throw new Error(`Name ${name} is already used for check`);
    }
    this._checkHandlers[name] = handler;
    return this;
  }

  addCheckProvider(name: string, provider: HealthcheckProvider) {
    const handler = (ctx: Context, context: CheckDataContext) =>
      provider.checkHealth(ctx, context);
    return this.addCheck(name, handler);
  }

  addDnsCheck(urlString: string): HealthcheckService {
    const url = new URL(urlString);
    const hostname = url.hostname;
    return this.addCheck(`dns:${hostname}`, async () => {
      await resolveAsync(hostname);
    });
  }

  onUnhealthy(unhealthyHandler: UnhealthyHandler): HealthcheckService {
    if (this._unhealthyHandler) {
      throw new Error('UnhealthyHandler is already set');
    }
    this._unhealthyHandler = unhealthyHandler;
    return this;
  }

  async runChecks(ctx: Context): Promise<HealthCheckResult> {
    const checkPromises = mapValues(
      this._checkHandlers,
      async (handler, checkName) => {
        const startAt = Date.now();
        const context = {};
        const checkPromise = (async () => {
          // Handler may be sync or async, we want
          // to catch both errors;
          return handler(ctx, context);
        })();
        const promises = [checkPromise];
        if (this._timeoutMs) {
          const timeoutPromise = delay(this._timeoutMs).then(() => {
            throw new Error(`Timeout in ${this._timeoutMs} ms`);
          });
          promises.push(timeoutPromise);
        }
        try {
          await Promise.race(promises);
          return {
            result: 'OK',
            timeMs: Date.now() - startAt,
            ...(isEmpty(context) ? {} : { context }),
          };
        } catch (err: any) {
          ctx.log.error({ err, checkName }, 'Healtcheck failed');
          return {
            result: err.toString(),
            timeMs: Date.now() - startAt,
            ...(isEmpty(context) ? {} : { context }),
          };
        }
      },
    );

    const checks = await props(checkPromises);
    const isHealthy = !find(checks, ({ result }) => result !== OkResult);
    const result = { checks, isHealthy };

    ctx.log.info(result, 'Healthcheck result');

    if (!isHealthy && this._unhealthyHandler) {
      await this._unhealthyHandler(result);
    }

    return result;
  }
}
