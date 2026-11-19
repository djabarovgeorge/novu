import { Logger } from '@nestjs/common';
import { env } from '@novu/application-generic';

const url = env.CRON_CHECKING_URL;
const LOG_CONTEXT = 'cronHealth';
export async function checkingForCronJob(cronId?: string) {
  if (env.NOVU_MANAGED_SERVICE && env.NODE_ENV === 'production' && cronId && url) {
    Logger.verbose(`Calling health endpoint for ${cronId}`);

    const response = await fetch(url + cronId);

    if (response.status !== 200) {
      Logger.error(`Failed calling better Uptime: ${response.status}`, LOG_CONTEXT);
    } else {
      Logger.verbose(`Response from better Uptime: ${response.status}`, LOG_CONTEXT);
    }
  }
}
