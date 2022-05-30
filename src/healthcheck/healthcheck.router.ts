import BaseRouter from '@/http/base-router';
import { StatusCodes } from 'http-status-codes';
import HealthcheckService from './healthcheck.service';

export default class HealthcheckRouter extends BaseRouter {
  constructor(private readonly _healthcheckService: HealthcheckService) {
    super();

    this.get('/', async (req, res) => {
      const result = await this._healthcheckService.runChecks(req.ctx);
      if (!result.isHealthy) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE);
      }
      return result;
    });
  }
}
