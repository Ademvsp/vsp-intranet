import {
	ANNUAL_LEAVE,
	GENERAL,
	MEETING,
	ON_SITE,
	OTHER_LEAVE,
	OUT_OF_OFFICE,
	PUBLIC_HOLIDAY,
	SICK_LEAVE,
	TRAINING
} from '../data/event-types';
import { CREATE, DELETE, UPDATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Event {
	constructor({
		eventId,
		actions,
		allDay,
		details,
		end,
		locations,
		metadata,
		start,
		subscribers,
		type,
		user
	}) {
		this.eventId = eventId;
		this.actions = actions;
		this.allDay = allDay;
		this.details = details;
		this.end = end;
		this.locations = locations;
		this.metadata = metadata;
		this.start = start;
		this.subscribers = subscribers;
		this.type = type;
		this.user = user;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.eventId;
		return databaseObject;
	}

	getEventTitle(users) {
		const eventUser = users.find((u) => u.userId === this.user);
		const eventUserFullName = eventUser.getFullName();
		switch (this.type) {
			case GENERAL:
				return this.details;
			case MEETING:
				return `${eventUserFullName} in a Meeting${
					this.details ? ` (${this.details})` : ''
				}`;
			case ON_SITE:
				return `${eventUserFullName} On Site${
					this.details ? ` (${this.details})` : ''
				}`;
			case TRAINING:
				return `${eventUserFullName} in Training${
					this.details ? ` (${this.details})` : ''
				}`;
			case OUT_OF_OFFICE:
				return `${eventUserFullName} Out of Office${
					this.details ? ` (${this.details})` : ''
				}`;
			case SICK_LEAVE:
				return `${eventUserFullName} on Sick Leave`;
			case ANNUAL_LEAVE:
				return `${eventUserFullName} on Annual Leave`;
			case OTHER_LEAVE:
				return `${eventUserFullName} on Other Leave${
					this.details ? ` (${this.details})` : ''
				}`;
			case PUBLIC_HOLIDAY:
				return `${this.details} Public Holiday`;
			default:
				return this.details;
		}
	}

	static async get(eventId) {
		const doc = await firebase
			.firestore()
			.collection('events-new')
			.doc(eventId)
			.get();
		if (!doc.exists) {
			return null;
		}
		const metadata = {
			...doc.data().metadata,
			createdAt: doc.data().metadata.createdAt.toDate(),
			updatedAt: doc.data().metadata.updatedAt.toDate()
		};

		return new Event({
			...doc.data(),
			eventId: doc.id,
			metadata: metadata,
			start: doc.data().start.toDate(),
			end: doc.data().end.toDate()
		});
	}

	async save(notifyUsers) {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.eventId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions = [
				...this.actions,
				{
					actionType: UPDATE,
					actionedAt: new Date(serverTime),
					actionedBy: firebase.auth().currentUser.uid,
					notifyUsers: notifyUsers
				}
			];
			await firebase
				.firestore()
				.collection('events-new')
				.doc(this.eventId)
				.update(this.getDatabaseObject());
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			this.actions = [
				{
					actionType: CREATE,
					actionedAt: new Date(serverTime),
					actionedBy: firebase.auth().currentUser.uid,
					notifyUsers: notifyUsers
				}
			];
			const docRef = await firebase
				.firestore()
				.collection('events-new')
				.add(this.getDatabaseObject());
			this.eventId = docRef.id;
		}
	}

	async delete(notifyUsers) {
		const serverTime = await getServerTimeInMilliseconds();
		this.metadata = {
			...this.metadata,
			updatedAt: new Date(serverTime),
			updatedBy: firebase.auth().currentUser.uid
		};
		//Send DELETE action to back end along with notifyUsers for back end to handle actual delete
		this.actions = [
			...this.actions,
			{
				actionType: DELETE,
				actionedAt: new Date(serverTime),
				actionedBy: firebase.auth().currentUser.uid,
				notifyUsers: notifyUsers
			}
		];
		await firebase
			.firestore()
			.collection('events-new')
			.doc(this.eventId)
			.update(this.getDatabaseObject());
	}

	static getListener(start, end) {
		return firebase
			.firestore()
			.collection('events-new')
			.where('start', '>=', start)
			.where('start', '<=', end)
			.orderBy('start', 'asc');
	}
}
