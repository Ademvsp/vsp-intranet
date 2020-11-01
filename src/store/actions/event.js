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
import { getServerTimeInMilliseconds } from '../../utils/firebase';
import { upload } from '../../utils/file-utils';

export const addEvent = (values) => {
	return async (dispatch, getState) => {
		const {
			notifyUsers,
			allDay,
			details,
			end,
			start,
			type,
			allCalendars
		} = values;
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
				allDay: allDay,
				details: details,
				end: endTransformed,
				locations: locations,
				start: startTransformed,
				subscribers: [authUser.userId],
				type: type.name,
				user: authUser.userId
			});
			await newEvent.save(notifyUsers);
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event added successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return true;
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
			return false;
		}
	};
};

export const editEvent = (event, values) => {
	return async (dispatch, getState) => {
		const {
			notifyUsers,
			allDay,
			details,
			end,
			start,
			type,
			allCalendars
		} = values;
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
			await newEvent.save(notifyUsers);
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event updated successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return true;
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
	};
};

export const deleteEvent = (event, notifyUsers) => {
	return async (dispatch, _getState) => {
		try {
			const newEvent = new Event({ ...event });
			await newEvent.delete(notifyUsers);
			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event deleted successfully',
				feedback: SNACKBAR,
				options: {
					duration: 5000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return true;
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
	};
};

export const addComment = (event, values) => {
	return async (dispatch, _getState) => {
		const newEvent = new Event({ ...event });
		const { body, attachments, notifyUsers } = values;
		let uploadedAttachments;
		try {
			const serverTime = await getServerTimeInMilliseconds();
			uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					upload({
						files: attachments,
						collection: 'events-new',
						collectionId: event.eventId,
						folder: serverTime.toString()
					})
				);
			}
			await newEvent.saveComment(
				body.trim(),
				uploadedAttachments,
				notifyUsers,
				serverTime
			);
			return true;
		} catch (error) {
			const message = new Message({
				title: 'Events',
				body: 'Comment failed to post',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
	};
};
