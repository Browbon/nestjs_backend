import { SetMetadata } from '@nestjs/common';
import { IGNORE_CACHING_META } from 'common/constant';

// set metadata with ignoreCaching to true
export const NoCache = () => SetMetadata(IGNORE_CACHING_META, true);
