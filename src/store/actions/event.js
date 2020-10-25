import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../../utils/constants';
import { SET_MESSAGE } from '../../utils/actions';
import Message from '../../models/message';
import Event from '../../models/event';
import { transformDate } from '../../utils/date';

export const addEvent = (values, notifyUsers) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations } = getState().dataState;
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
				type: type.name,
				user: authUser.userId
			});
			newEvent.notifyUsers = notifyUsers;
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
		// try {
		// 	const recipients = users.filter(
		// 		(user) =>
		// 			newEvent.subscribers.includes(user.userId) ||
		// 			notifyUsers.includes(user.userId)
		// 	);
		// 	if (recipients.length > 0) {
		// 		const notifications = [];
		// 		for (const recipient of recipients) {
		// 			const senderFullName = getFullName(authUser);
		// 			const readableTitle = getReadableTitle(
		// 				{
		// 					details: newEvent.details,
		// 					type: newEvent.type,
		// 					user: authUser.userId
		// 				},
		// 				users
		// 			);
		// 			const emailData = {
		// 				eventTitle: readableTitle,
		// 				start: newEvent.start.getTime(),
		// 				end: newEvent.end.getTime(),
		// 				allDay: newEvent.allDay
		// 			};
		// 			const notification = new Notification({
		// 				notificationId: null,
		// 				emailData: emailData,
		// 				link: `/calendar/${newEvent.eventId}`,
		// 				page: 'Staff Calendar',
		// 				recipient: transformedRecipient(recipient),
		// 				title: `Staff Calendar "${readableTitle}" created by ${senderFullName}`,
		// 				type: NEW_EVENT
		// 			});
		// 			notifications.push(notification);
		// 		}
		// 		await Notification.saveAll(notifications);
		// 	}
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};

export const editEvent = (event, values, notifyUsers) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations } = getState().dataState;
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
				type: type.name
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
		// try {
		// 	const recipients = users.filter(
		// 		(user) =>
		// 			newEvent.subscribers.includes(user.userId) ||
		// 			notifyUsers.includes(user.userId)
		// 	);
		// 	if (recipients.length > 0) {
		// 		const notifications = [];
		// 		for (const recipient of recipients) {
		// 			const senderFullName = getFullName(authUser);
		// 			const readableTitle = getReadableTitle(
		// 				{
		// 					details: newEvent.details,
		// 					type: newEvent.type,
		// 					user: authUser.userId
		// 				},
		// 				users
		// 			);
		// 			const emailData = {
		// 				eventTitle: readableTitle,
		// 				start: newEvent.start.getTime(),
		// 				end: newEvent.end.getTime(),
		// 				allDay: newEvent.allDay
		// 			};
		// 			const notification = new Notification({
		// 				notificationId: null,
		// 				emailData: emailData,
		// 				link: `/calendar/${newEvent.eventId}`,
		// 				page: 'Staff Calendar',
		// 				recipient: transformedRecipient(recipient),
		// 				title: `Staff Calendar "${readableTitle}" updated by ${senderFullName}`,
		// 				type: EDIT_EVENT
		// 			});
		// 			notifications.push(notification);
		// 		}
		// 		await Notification.saveAll(notifications);
		// 	}
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};

export const deleteEvent = (event, notifyUsers) => {
	return async (dispatch, getState) => {
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
		// try {
		// 	const recipients = users.filter(
		// 		(user) =>
		// 			event.subscribers.includes(user.userId) ||
		// 			notifyUsers.includes(user.userId)
		// 	);
		// 	if (recipients.length > 0) {
		// 		const notifications = [];
		// 		for (const recipient of recipients) {
		// 			const senderFullName = getFullName(authUser);
		// 			const readableTitle = getReadableTitle(
		// 				{
		// 					details: event.details,
		// 					type: event.type,
		// 					user: authUser.userId
		// 				},
		// 				users
		// 			);
		// 			const emailData = {
		// 				eventTitle: readableTitle,
		// 				start: event.start.getTime(),
		// 				end: event.end.getTime(),
		// 				allDay: event.allDay
		// 			};
		// 			const notification = new Notification({
		// 				notificationId: null,
		// 				emailData: emailData,
		// 				link: '/calendar',
		// 				page: 'Staff Calendar',
		// 				recipient: transformedRecipient(recipient),
		// 				title: `Staff Calendar "${readableTitle}" deleted by ${senderFullName}`,
		// 				type: DELETE_EVENT
		// 			});
		// 			notifications.push(notification);
		// 		}
		// 		await Notification.saveAll(notifications);
		// 	}
		// 	return true;
		// } catch (error) {
		// 	return true;
		// }
	};
};
