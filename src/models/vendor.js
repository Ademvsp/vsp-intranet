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
				.collection('vendors-new')
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
			// await firebase
			// 	.firestore()
			// 	.collection('collection-data')
			// 	.doc('vendors')
			// 	.update({
			// 		documents: firebase.firestore.FieldValue.arrayUnion(this.vendorId)
			// 	});
		}
	}

	static getListener() {
		return firebase
			.firestore()
			.collection('vendors-new')
			.orderBy('name', 'asc');
	}
}
