import firebase from '../utils/firebase';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_VARIANTS,
	SNACKBAR_SEVERITY
} from '../utils/constants';
import { SET_MESSAGE, SET_EVENTS } from '../utils/actions';
import { NEW_EVENT } from '../utils/notification-template-codes';
import Message from '../models/message';
import Event from '../models/event';
import * as notificationController from './notification';
import { eventTypeNames } from '../utils/event-types';
import moment from 'moment-timezone';
let eventsListener;

export const subscribeEventsListener = (start, end) => {
	return async (dispatch, _getState) => {
		try {
			unsubscribeEventsListener();
			eventsListener = firebase
				.firestore()
				.collection('eventsNew')
				.where('start', '>=', start)
				.where('start', '<=', end)
				.orderBy('start', 'asc')
				.onSnapshot((snapshot) => {
					if (!snapshot.metadata.hasPendingWrites) {
						const events = snapshot.docs.map((doc) => {
							return new Event({
								eventId: doc.id,
								allDay: doc.data().allDay,
								createdAt: doc.data().createdAt.toDate(),
								createdBy: doc.data().createdBy,
								details: doc.data().details,
								end: doc.data().end.toDate(),
								locations: doc.data().locations,
								participants: doc.data().participants,
								start: doc.data().start.toDate(),
								subscribers: doc.data().subscribers,
								type: doc.data().type
							});
						});
						dispatch({
							type: SET_EVENTS,
							events
						});
					}
				});
		} catch (error) {
			const message = new Message({
				details: 'Invalid Credentials',
				body: 'Incorrect email or password',
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

export const addEvent = (values, notifyUsers) => {
	return async (dispatch, getState) => {
		const { allDay, details, end, start, type, allCalendars } = values;
		const authUser = getState().authState.authUser;
		const { locations: dataStateLocations, users } = getState().dataState;
		let eventId;
		try {
			const userLocation = dataStateLocations.find(
				(dataStateLocation) =>
					dataStateLocation.locationId === authUser.location
			);
			let locations = [authUser.location];
			if (allCalendars) {
				locations = dataStateLocations.map((location) => location.locationId);
			}

			let startTransformed = moment.tz(start, userLocation.timezone);
			let endTransformed = moment.tz(end, userLocation.timezone);
			if (allDay) {
				startTransformed = moment.tz(start, userLocation.timezone).set({
					hour: 12,
					minutes: 0
				});
				endTransformed = moment.tz(end, userLocation.timezone).set({
					hour: 12,
					minutes: 0
				});
			}
			const event = {
				allDay,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				createdBy: authUser.userId,
				details,
				end: endTransformed.toDate(),
				locations,
				start: startTransformed.toDate(),
				subscribers: [authUser.userId],
				type: type.eventTypeId
			};
			const docRef = await firebase
				.firestore()
				.collection('eventsNew')
				.add(event);
			eventId = docRef.id;
			await firebase
				.firestore()
				.collection('counters')
				.doc('events')
				.update({
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(eventId)
				});

			const message = new Message({
				title: 'Staff Calendar',
				body: 'Event added successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.INFO
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				details: 'Staff Calendar',
				body: 'Failed to add event',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		try {
			//Perform this without disruptive error catching
			const readableTitle = getReadableTitle(
				{
					details,
					createdBy: authUser.userId,
					type: type.eventTypeId
				},
				users
			);
			await notificationController.sendNotification({
				type: NEW_EVENT,
				recipients: notifyUsers,
				eventId,
				title: readableTitle,
				start,
				end,
				allDay
			});
		} catch (error) {
			return true;
		}
		return true;
	};
};

export const getReadableTitle = (data, users) => {
	const { details, createdBy, type } = data;
	const eventUser = users.find((user) => user.userId === createdBy);
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
