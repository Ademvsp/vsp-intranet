export const LONG_DATE_TIME = 'eee, d MMM yyyy, h:mm aaa';
export const LONG_DATE = 'eee, d MMM yyyy';
export const FULL_DATE_TIME = 'yyyy-MM-dd HH:mm:ss zzz';
export const SHORT_DATE = 'dd/MM/yyyy';
export const MILLISECONDS = 'T';
export const LOCALE = 'en-au';
export const millisecondsToDate = (milliseconds) => {
	return new Date(parseInt(milliseconds));
};
