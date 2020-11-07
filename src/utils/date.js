import { utcToZonedTime } from 'date-fns-tz';
import { set } from 'date-fns';

export const LONG_DATE_TIME = 'eee, d MMM yyyy, h:mm aaa';
export const LONG_DATE = 'eee, d MMM yyyy';
export const FULL_DATE_TIME = 'yyyy-MM-dd HH:mm:ss zzz';
export const SHORT_DATE = 'dd/MM/yyyy';
export const MILLISECONDS = 'T';
export const LOCALE = 'en-au';
export const DAY_IN_MILLISECONDS = 86400000;

export const millisecondsToDate = (milliseconds) => {
  return new Date(parseInt(milliseconds));
};

export const transformDate = (date, allDay, timezone) => {
  const zonedDate = utcToZonedTime(date, timezone);
  let transformedDate = millisecondsToDate(zonedDate.getTime());
  if (allDay) {
    transformedDate = set(new Date(transformedDate), {
      hours: 12,
      minutes: 0
    });
  }
  return transformedDate;
};
