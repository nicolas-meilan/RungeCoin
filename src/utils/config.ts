import { ENV } from '@env';

const PRODUCTION_ENV = 'PRODUCTION';

export const isDev = () => ENV !== PRODUCTION_ENV;
