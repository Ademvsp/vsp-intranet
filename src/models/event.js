import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Event {
	constructor(
		eventId,
		allDay,
		details,
		end,
		locations,
		metadata,
		start,
		subscribers,
		type,
		user
	) {
		this.eventId = eventId;
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

	static async get(eventId) {
		const doc = await firebase
			.firestore()
			.collection('eventsNew')
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
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (this.eventId) {
			this.metadata = {
				...this.metadata,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			await firebase
				.firestore()
				.collection('eventsNew')
				.doc(this.eventId)
				.update({
					allDay: this.allDay,
					details: this.details,
					end: this.end,
					locations: this.locations,
					metadata: this.metadata,
					start: this.start,
					subscribers: this.subscribers,
					type: this.type,
					user: this.user
				});
		} else {
			this.metadata = {
				createdAt: new Date(serverTime),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: new Date(serverTime),
				updatedBy: firebase.auth().currentUser.uid
			};
			const docRef = await firebase.firestore().collection('eventsNew').add({
				allDay: this.allDay,
				details: this.details,
				end: this.end,
				locations: this.locations,
				metadata: this.metadata,
				start: this.start,
				subscribers: this.subscribers,
				type: this.type,
				user: this.user
			});
			this.eventId = docRef.id;
			await firebase
				.firestore()
				.collection('counters')
				.doc('events')
				.update({
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(this.eventId)
				});
		}
	}

	async delete() {
		await firebase
			.firestore()
			.collection('eventsNew')
			.doc(this.eventId)
			.delete();
		await firebase
			.firestore()
			.collection('counters')
			.doc('events')
			.update({
				count: firebase.firestore.FieldValue.increment(-1),
				documents: firebase.firestore.FieldValue.arrayRemove(this.eventId)
			});
	}

	static getListener(start, end) {
		return firebase
			.firestore()
			.collection('eventsNew')
			.where('start', '>=', start)
			.where('start', '<=', end)
			.orderBy('start', 'asc');
	}
}
