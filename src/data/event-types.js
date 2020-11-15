export const GENERAL = 'General';
export const MEETING = 'Meeting';
export const ON_SITE = 'On Site';
export const TRAINING = 'Training';
export const OUT_OF_OFFICE = 'Out of Office';
export const SICK_LEAVE = 'Sick Leave';
export const ANNUAL_LEAVE = 'Annual Leave';
export const OTHER_LEAVE = 'Other Leave';
export const PUBLIC_HOLIDAY = 'Public Holiday';
export const PUBLIC_ANNOUNCEMENT = 'Public Announcement';

export default [
  {
    name: GENERAL,
    detailsEditable: true,
    allCalendars: false
  },
  {
    name: MEETING,
    detailsEditable: true,
    allCalendars: false
  },
  {
    name: ON_SITE,
    detailsEditable: true,
    allCalendars: false
  },
  {
    name: TRAINING,
    detailsEditable: true,
    allCalendars: false
  },
  {
    name: OUT_OF_OFFICE,
    detailsEditable: true,
    allCalendars: false
  },
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
  },
  {
    name: PUBLIC_HOLIDAY,
    detailsEditable: true,
    allCalendars: true
  },
  {
    name: PUBLIC_ANNOUNCEMENT,
    detailsEditable: true,
    allCalendars: true
  }
];
