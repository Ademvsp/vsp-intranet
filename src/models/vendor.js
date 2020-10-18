import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';

export default class Vendor {
	constructor({ vendorId, name }) {
		this.vendorId = vendorId;
		this.name = name;
	}

	async save() {
		const serverTime = await getServerTimeInMilliseconds();
		if (!this.vendorId) {
			const docRef = await firebase
				.firestore()
				.collection('vendorsNew')
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
			this.vendorId = docRef.id;
			await firebase
				.firestore()
				.collection('counters')
				.doc('vendors')
				.update({
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(this.vendorId)
				});
		}
	}

	static getListener() {
		return firebase.firestore().collection('vendorsNew').orderBy('name', 'asc');
	}
}
