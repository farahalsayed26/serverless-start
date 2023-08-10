import serverless from '../libs/baseServerless';

import r from './resources';
import f from './functions'

module.exports = serverless({
  service: 'api-service-stack',
  provider: {
    architecture: 'x86_64',
    timeout: 29,
    apiGateway: {
      metrics: true,
      shouldStartNameWithService: true
    },
    logRetentionInDays: 90,
    tracing: {
      lambda: true,
      apiGateway: true
    },
    logs: {
      restApi: true
    }
  },
  custom: { },
  functions: f,
  resources: r
});