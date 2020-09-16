import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE, SET_EVENTS } from '../utils/actions';
import Message from '../models/message';
import Event from '../models/event';
import { eventTypeNames } from '../utils/event-types';
import moment from 'moment-timezone';
let eventsListener;

export const subscribeEventsListener = (start, end) => {
	return async (dispatch, _getState) => {
		try {
			unsubscribeEventsListener();
			eventsListener = Event.getEventListener(start, end).onSnapshot(
				(snapshot) => {
					if (!snapshot.metadata.hasPendingWrites) {
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
					}
				}
			);
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

export const addEvent = (values) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations } = getState().dataState;
		let startTransformed, endTransformed;
		try {
			const userLocation = dataStateLocations.find(
				(dataStateLocation) =>
					dataStateLocation.locationId === authUser.location
			);
			let locations = [authUser.location];
			if (allCalendars) {
				locations = dataStateLocations.map((location) => location.locationId);
			}

			startTransformed = moment.tz(start, userLocation.timezone).toDate();
			endTransformed = moment.tz(end, userLocation.timezone).toDate();
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
			const metadata = {
				createdAt: Event.getServerTimestamp(),
				createdBy: authUser.userId,
				updatedAt: Event.getServerTimestamp(),
				updatedBy: authUser.userId
			};

			const newEvent = new Event(
				null,
				allDay,
				details,
				endTransformed,
				locations,
				metadata,
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
			return newEvent;
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
	};
};

export const editEvent = (event, values) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const { authUser } = getState().authState;
		const { locations: dataStateLocations } = getState().dataState;
		const { eventId } = event;
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
			const metadata = {
				...event.metadata,
				updatedAt: Event.getServerTimestamp(),
				updatedBy: authUser.userId
			};

			const newEvent = new Event(
				eventId,
				allDay,
				details,
				endTransformed,
				locations,
				metadata,
				startTransformed,
				event.subscribers,
				type.eventTypeId,
				authUser.userId
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
			return newEvent;
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
	};
};

export const deleteEvent = (event) => {
	return async (dispatch, _getState) => {
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
			return true;
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
