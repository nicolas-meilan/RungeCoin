import { format } from 'date-fns';
import { t } from 'i18next';

export const delay = (seconds: number) => new Promise((resolve) => {
  const timeout = setTimeout(() => {
    resolve(undefined);
    clearTimeout(timeout);
  }, seconds * 1000);
});

export const formatDate = (timestamp: string, datetime: boolean = true) => (
  format(new Date(Number(timestamp) * 1000), t(datetime ? 'dateformat.datetime' : 'dateformat.date')).toUpperCase()
);