import * as dotenv from 'dotenv';
import { getContextPath, NovuComponentEnum } from '@novu/shared';

dotenv.config();

let path;

switch (process.env.NODE_ENV) {
  case 'production':
    path = `${__dirname}/../.env.production`;
    break;
  case 'test':
    path = `${__dirname}/../.env.test`;
    break;
  case 'ci':
    path = `${__dirname}/../.env.ci`;
    break;
  case 'local':
    path = `${__dirname}/../.env`;
    break;
  case 'dev':
    path = `${__dirname}/../.env.development`;
    break;
  default:
    path = `${__dirname}/../.env`;
}

const { error } = dotenv.config({ path });

if (error && !process.env.LAMBDA_TASK_ROOT) throw error;

export const CONTEXT_PATH = getContextPath(NovuComponentEnum.WS);
