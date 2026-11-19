import { Injectable } from '@nestjs/common';
import { SystemCriticalFlagsEnum } from '@novu/shared';

import { GetFeatureFlag } from './get-feature-flag.use-case';
import { GetSystemCriticalFlag } from './get-system-critical-flag.use-case';
import { env } from '../../config';

@Injectable()
export class GetIsInMemoryClusterModeEnabled extends GetSystemCriticalFlag {
  execute(): boolean {
    const value =
      env.IS_IN_MEMORY_CLUSTER_MODE_ENABLED ??
      env.IN_MEMORY_CLUSTER_MODE_ENABLED;
    const fallbackValue = false;
    const defaultValue = this.prepareBooleanStringSystemCriticalFlag(
      value,
      fallbackValue
    );
    const key = SystemCriticalFlagsEnum.IS_IN_MEMORY_CLUSTER_MODE_ENABLED;

    this.log<boolean>(key, defaultValue);

    return defaultValue;
  }
}
