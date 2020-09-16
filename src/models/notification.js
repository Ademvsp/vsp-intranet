import firebase from '../utils/firebase';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;

export default class Notificaion {
	constructor(
		notificationId,
		createdAt,
		createdBy,
		link,
		page,
		recipient,
		title
	) {
		this.notificationId = notificationId;
		this.createdAt = createdAt;
		this.createdBy = createdBy;
		this.link = link;
		this.page = page;
		this.recipient = recipient;
		this.title = title;
	}

	async delete() {
		await firebase
			.firestore()
			.collection('notificationsNew')
			.doc(this.notificationId)
			.delete();
	}

	static async deleteAll(notifications) {
		const batch = firebase.firestore().batch();
		for (const notification of notifications) {
			const docRef = firebase
				.firestore()
				.collection('notificationsNew')
				.doc(notification.notificationId);
			batch.delete(docRef);
		}
		await batch.commit();
	}

	static getListener(userId) {
		const ONE_MONTH_MILLISECONDS = 2592000000;
		const ONE_MONTH_AGO_MILLISECONDS =
			new Date().getTime() - ONE_MONTH_MILLISECONDS;
		const ONE_MONTH_AGO_DATE = new Date(ONE_MONTH_AGO_MILLISECONDS);
		const ONE_MONTH_AGO_TIMESTAMP = firebase.firestore.Timestamp.fromDate(
			ONE_MONTH_AGO_DATE
		);

		return firebase
			.firestore()
			.collection('notificationsNew')
			.where('createdBy', '==', userId)
			.where('createdAt', '>=', ONE_MONTH_AGO_TIMESTAMP)
			.orderBy('createdAt', 'desc');
	}

	static async send(data) {
		const functionRef = firebase
			.app()
			.functions(region)
			.httpsCallable('sendNotificationNew');
		await functionRef(data);
	}
}
