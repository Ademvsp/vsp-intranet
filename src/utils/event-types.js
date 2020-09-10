export const eventTypeNames = {
	GENERAL: 'General',
	MEETING: 'Meeting',
	ON_SITE: 'On Site',
	TRAINING: 'Training',
	OUT_OF_OFFICE: 'Out of Office',
	SICK_LEAVE: 'Sick Leave',
	ANNUAL_LEAVE: 'Annual Leave',
	OTHER_LEAVE: 'Other Leave',
	PUBLIC_HOLIDAY: 'Public Holiday',
	PUBLIC_ANNOUNCEMENT: 'Public Announcement'
};

export default [
	{
		eventTypeId: eventTypeNames.GENERAL.toLowerCase(),
		name: eventTypeNames.GENERAL,
		oldId: 'wuCIUSKZ2F1AHM89YDje',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.MEETING.toLowerCase(),
		name: eventTypeNames.MEETING,
		oldId: 'I7RgJXgEDwh0cFNPCHQe',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.ON_SITE.toLocaleLowerCase(),
		name: eventTypeNames.ON_SITE,
		oldId: 'z5RBlXwJNBy2jBB3IZEt',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.TRAINING.toLocaleLowerCase(),
		name: eventTypeNames.TRAINING,
		oldId: 'WqS79SRz8jKsfZtwJn9A',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.OUT_OF_OFFICE.toLocaleLowerCase(),
		name: eventTypeNames.OUT_OF_OFFICE,
		oldId: 'EaiiAEEzclVHAntOifzH',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.SICK_LEAVE.toLocaleLowerCase(),
		name: eventTypeNames.SICK_LEAVE,
		oldId: 'cYfHSxKP8rlXWltUMErP',
		detailsEditable: false,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.ANNUAL_LEAVE.toLocaleLowerCase(),
		name: eventTypeNames.ANNUAL_LEAVE,
		oldId: 'FNx0MFY3hTgeuVFv7wjl',
		detailsEditable: false,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.OTHER_LEAVE.toLocaleLowerCase(),
		name: eventTypeNames.OTHER_LEAVE,
		oldId: 'kD7bldyNLTrw5wtQRUTP',
		detailsEditable: true,
		allCalendars: false
	},
	{
		eventTypeId: eventTypeNames.PUBLIC_HOLIDAY.toLocaleLowerCase(),
		name: eventTypeNames.PUBLIC_HOLIDAY,
		oldId: '',
		detailsEditable: true,
		allCalendars: true
	},
	{
		eventTypeId: eventTypeNames.PUBLIC_ANNOUNCEMENT.toLocaleLowerCase(),
		name: eventTypeNames.PUBLIC_ANNOUNCEMENT,
		oldId: '',
		detailsEditable: true,
		allCalendars: true
	}
];
