import { storageUtils } from '../utils/storageUtils';
import { APP_CONFIG } from '../constants/config';

export const dbStorage = {
  ...storageUtils,
  KEYS: APP_CONFIG.STORAGE_KEYS
};
