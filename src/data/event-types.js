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
		eventTypeId: GENERAL.toLowerCase(),
		name: GENERAL,
		oldId: 'wuCIUSKZ2F1AHM89YDje',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: MEETING.toLowerCase(),
		name: MEETING,
		oldId: 'I7RgJXgEDwh0cFNPCHQe',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: ON_SITE.toLocaleLowerCase(),
		name: ON_SITE,
		oldId: 'z5RBlXwJNBy2jBB3IZEt',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: TRAINING.toLocaleLowerCase(),
		name: TRAINING,
		oldId: 'WqS79SRz8jKsfZtwJn9A',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: OUT_OF_OFFICE.toLocaleLowerCase(),
		name: OUT_OF_OFFICE,
		oldId: 'EaiiAEEzclVHAntOifzH',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: SICK_LEAVE.toLocaleLowerCase(),
		name: SICK_LEAVE,
		oldId: 'cYfHSxKP8rlXWltUMErP',
		detailsEditable: false,
		allCalendars: false
	},
	{
		eventTypeId: ANNUAL_LEAVE.toLocaleLowerCase(),
		name: ANNUAL_LEAVE,
		oldId: 'FNx0MFY3hTgeuVFv7wjl',
		detailsEditable: false,
		allCalendars: false
	},
	{
		eventTypeId: OTHER_LEAVE.toLocaleLowerCase(),
		name: OTHER_LEAVE,
		oldId: 'kD7bldyNLTrw5wtQRUTP',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: PUBLIC_HOLIDAY.toLocaleLowerCase(),
		name: PUBLIC_HOLIDAY,
		oldId: '',
		detailsEditable: true,
		allCalendars: true
	},
	{
		eventTypeId: PUBLIC_ANNOUNCEMENT.toLocaleLowerCase(),
		name: PUBLIC_ANNOUNCEMENT,
		oldId: '',
		detailsEditable: true,
		allCalendars: true
	}
];
