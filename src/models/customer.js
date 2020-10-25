import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Customer {
	constructor({ customerId, name }) {
		this.customerId = customerId;
		this.name = name;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (!this.customerId) {
			const docRef = await firebase
				.firestore()
				.collection('customers-new')
				.add({
					metadata: {
						createdAt: new Date(serverTime),
						createdBy: firebase.auth().currentUser.uid,
						updatedAt: new Date(serverTime),
						updatedBy: firebase.auth().currentUser.uid
					},
					name: this.name,
					source: 'internal',
					sourceId: null
				});
			this.customerId = docRef.id;
			await firebase
				.firestore()
				.collection('collection-data')
				.doc('customers')
				.update({
					documents: firebase.firestore.FieldValue.arrayUnion(this.customerId)
				});
		}
	}

	static getListener() {
		return firebase
			.firestore()
			.collection('customers-new')
			.orderBy('name', 'asc');
	}
}
