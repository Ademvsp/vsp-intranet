import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE } from '../utils/actions';
import Message from '../models/message';
import Event from '../models/event';
import Notification from '../models/notification';
import { eventTypeNames } from '../utils/event-types';
import { format } from 'date-fns-tz';
import { set } from 'date-fns';
import {
	DELETE_EVENT,
	EDIT_EVENT,
	NEW_EVENT
} from '../data/notification-types';
import { MILLISECONDS, millisecondsToDate } from '../utils/date';
import { transformedRecipient } from './notification';
import { getFullName } from './user';

export const getReadableTitle = (data, users) => {
	const { details, user, type } = data;
	const eventUser = users.find((u) => u.userId === user);
	const eventUserName = `${eventUser.firstName} ${eventUser.lastName}`;
	const {
		GENERAL,
		MEETING,
		ON_SITE,
		TRAINING,
		OUT_OF_OFFICE,
		SICK_LEAVE,
		ANNUAL_LEAVE,
		OTHER_LEAVE,
		PUBLIC_HOLIDAY
	} = eventTypeNames;
	switch (type) {
		case GENERAL.toLowerCase():
			return details;
		case MEETING.toLowerCase():
			return `${eventUserName} in a Meeting${details ? ` (${details})` : ''}`;
		case ON_SITE.toLowerCase():
			return `${eventUserName} On Site${details ? ` (${details})` : ''}`;
		case TRAINING.toLowerCase():
			return `${eventUserName} in Training${details ? ` (${details})` : ''}`;
		case OUT_OF_OFFICE.toLowerCase():
			return `${eventUserName} Out of Office${details ? ` (${details})` : ''}`;
		case SICK_LEAVE.toLowerCase():
			return `${eventUserName} on Sick Leave`;
		case ANNUAL_LEAVE.toLowerCase():
			return `${eventUserName} on Annual Leave`;
		case OTHER_LEAVE.toLowerCase():
			return `${eventUserName} on Other Leave${details ? ` (${details})` : ''}`;
		case PUBLIC_HOLIDAY.toLowerCase():
			return `${details} Public Holiday`;
		default:
			return details;
	}
};

const transformDate = (date, allDay, timezone) => {
	let transformedDate = millisecondsToDate(
		format(date, MILLISECONDS, {
			timeZone: timezone
		})
	);
	if (allDay) {
		transformedDate = set(new Date(transformedDate), {
			hours: 12,
			minutes: 0
		});
	}
	return transformedDate;
};

export const getListener = (start, end) => {
	return Event.getListener(start, end);
};

export const addEvent = (values, notifyUsers) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations, users } = getState().dataState;
		let newEvent;
		try {
			const userLocation = dataStateLocations.find(
				(dataStateLocation) =>
					dataStateLocation.locationId === authUser.location
			);
			let locations = [authUser.location];
			if (allCalendars) {
				locations = dataStateLocations.map((location) => location.locationId);
			}
			let startTransformed = transformDate(
				start,
				allDay,
				userLocation.timezone
			);
			let endTransformed = transformDate(end, allDay, userLocation.timezone);

			const subscribers = [authUser.userId];
			newEvent = new Event({
				eventId: null,
				allDay: allDay,
				details: details,
				end: endTransformed,
				locations: locations,
				metadata: null,
				start: startTransformed,
				subscribers: subscribers,
				type: type.eventTypeId,
				user: authUser.userId
			});
			await newEvent.save();
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event added successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Failed to add event',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return null;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newEvent.subscribers.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = getFullName(authUser);
					const readableTitle = getReadableTitle(
						{
							details: newEvent.details,
							type: newEvent.type,
							user: authUser.userId
						},
						users
					);
					const emailData = {
						eventTitle: readableTitle,
						start: newEvent.start.getTime(),
						end: newEvent.end.getTime(),
						allDay: newEvent.allDay
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/calendar/${newEvent.eventId}`,
						page: 'Staff Calendar',
						recipient: transformedRecipient(recipient),
						title: `Staff Calendar "${readableTitle}" created by ${senderFullName}`,
						type: NEW_EVENT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const editEvent = (event, values, notifyUsers) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations, users } = getState().dataState;
		let newEvent;
		try {
			const userLocation = dataStateLocations.find(
				(dataStateLocation) =>
					dataStateLocation.locationId === authUser.location
			);
			let locations = [authUser.location];
			if (allCalendars) {
				locations = dataStateLocations.map((location) => location.locationId);
			}
			let startTransformed = transformDate(
				start,
				allDay,
				userLocation.timezone
			);
			let endTransformed = transformDate(end, allDay, userLocation.timezone);

			newEvent = new Event({
				...event,
				allDay: allDay,
				details: details,
				end: endTransformed,
				locations: locations,
				start: startTransformed,
				type: type.eventTypeId
			});
			await newEvent.save();
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event updated successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Failed to edit event',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newEvent.subscribers.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = getFullName(authUser);
					const readableTitle = getReadableTitle(
						{
							details: newEvent.details,
							type: newEvent.type,
							user: authUser.userId
						},
						users
					);
					const emailData = {
						eventTitle: readableTitle,
						start: newEvent.start.getTime(),
						end: newEvent.end.getTime(),
						allDay: newEvent.allDay
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/calendar/${newEvent.eventId}`,
						page: 'Staff Calendar',
						recipient: transformedRecipient(recipient),
						title: `Staff Calendar "${readableTitle}" updated by ${senderFullName}`,
						type: EDIT_EVENT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const deleteEvent = (event, notifyUsers) => {
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		try {
			await event.delete();
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event deleted successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Failed to delete event',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					event.subscribers.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = getFullName(authUser);
					const readableTitle = getReadableTitle(
						{
							details: event.details,
							type: event.type,
							user: authUser.userId
						},
						users
					);
					const emailData = {
						eventTitle: readableTitle,
						start: event.start.getTime(),
						end: event.end.getTime(),
						allDay: event.allDay
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: '/calendar',
						page: 'Staff Calendar',
						recipient: transformedRecipient(recipient),
						title: `Staff Calendar "${readableTitle}" deleted by ${senderFullName}`,
						type: DELETE_EVENT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};
