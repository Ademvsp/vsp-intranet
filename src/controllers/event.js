import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE, SET_EVENTS } from '../utils/actions';
import Message from '../models/message';
import Event from '../models/event';
import Notification from '../models/notification';
import { eventTypeNames } from '../utils/event-types';
import moment from 'moment-timezone';
import {
	DELETE_EVENT,
	EDIT_EVENT,
	NEW_EVENT
} from '../utils/notification-types';
let eventsListener;

export const subscribeEventsListener = (start, end) => {
	return async (dispatch, _getState) => {
		try {
			unsubscribeEventsListener();
			eventsListener = Event.getListener(start, end).onSnapshot((snapshot) => {
				const events = snapshot.docs.map((doc) => {
					const metadata = {
						...doc.data().metadata,
						createdAt: doc.data().metadata.createdAt.toDate(),
						updatedAt: doc.data().metadata.updatedAt.toDate()
					};
					return new Event(
						doc.id,
						doc.data().allDay,
						doc.data().details,
						doc.data().end.toDate(),
						doc.data().locations,
						metadata,
						doc.data().start.toDate(),
						doc.data().subscribers,
						doc.data().type,
						doc.data().user
					);
				});
				dispatch({
					type: SET_EVENTS,
					events
				});
			});
		} catch (error) {
			const message = new Message(
				'Staff Calendar',
				'Failed to retrieve events',
				DIALOG
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
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

			let startTransformed = moment.tz(start, userLocation.timezone).toDate();
			let endTransformed = moment.tz(end, userLocation.timezone).toDate();
			if (allDay) {
				startTransformed = moment
					.tz(start, userLocation.timezone)
					.set({
						hour: 12,
						minutes: 0
					})
					.toDate();
				endTransformed = moment
					.tz(end, userLocation.timezone)
					.set({
						hour: 12,
						minutes: 0
					})
					.toDate();
			}
			const subscribers = [authUser.userId];
			newEvent = new Event(
				null,
				allDay,
				details,
				endTransformed,
				locations,
				null,
				startTransformed,
				subscribers,
				type.eventTypeId,
				authUser.userId
			);
			await newEvent.save();
			const message = new Message(
				'Staff Calendar',
				'Event added successfully',
				SNACKBAR,
				{
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message(
				'Staff Calendar',
				'Failed to add event',
				DIALOG
			);
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
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
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
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification(
						null,
						emailData,
						`/calendar/event?eventId=${newEvent.eventId}`,
						null,
						'Staff Calendar',
						transformedRecipient,
						`Staff Calendar "${readableTitle}" created by ${senderFullName}`,
						NEW_EVENT
					);
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

			let startTransformed = moment.tz(start, userLocation.timezone).toDate();
			let endTransformed = moment.tz(end, userLocation.timezone).toDate();
			if (allDay) {
				startTransformed = moment
					.tz(start, userLocation.timezone)
					.set({
						hour: 12,
						minutes: 0
					})
					.toDate();
				endTransformed = moment
					.tz(end, userLocation.timezone)
					.set({
						hour: 12,
						minutes: 0
					})
					.toDate();
			}

			newEvent = new Event(
				event.eventId,
				allDay,
				details,
				endTransformed,
				locations,
				event.metadata,
				startTransformed,
				event.subscribers,
				type.eventTypeId,
				event.user
			);
			await newEvent.save();
			const message = new Message(
				'Staff Calendar',
				'Event updated successfully',
				SNACKBAR,
				{
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message(
				'Staff Calendar',
				'Failed to add event',
				DIALOG
			);
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
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
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
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification(
						null,
						emailData,
						`/calendar/event?eventId=${newEvent.eventId}`,
						null,
						'Staff Calendar',
						transformedRecipient,
						`Staff Calendar "${readableTitle}" updated by ${senderFullName}`,
						EDIT_EVENT
					);
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
			const message = new Message(
				'Staff Calendar',
				'Event deleted successfully',
				SNACKBAR,
				{
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			);
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message(
				'Staff Calendar',
				'Failed to delete event',
				DIALOG
			);
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
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
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
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification(
						null,
						emailData,
						'/calendar',
						null,
						'Staff Calendar',
						transformedRecipient,
						`Staff Calendar "${readableTitle}" deleted by ${senderFullName}`,
						DELETE_EVENT
					);
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

export const unsubscribeEventsListener = () => {
	if (eventsListener) {
		eventsListener();
	}
};
