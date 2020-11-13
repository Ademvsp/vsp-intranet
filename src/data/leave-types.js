export const SICK_LEAVE = 'Sick Leave';
export const ANNUAL_LEAVE = 'Annual Leave';
export const OTHER_LEAVE = 'Other Leave';

export default [
  {
    name: SICK_LEAVE,
    detailsEditable: false,
    allCalendars: false
  },
  {
    name: ANNUAL_LEAVE,
    detailsEditable: false,
    allCalendars: false
  },
  {
    name: OTHER_LEAVE,
    detailsEditable: true,
    allCalendars: false
  }
];
