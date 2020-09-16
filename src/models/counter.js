import firebase from '../utils/firebase';

export default class Counter {
	constructor(collection, count, documents) {
		this.collection = collection;
		this.count = count;
		this.documents = documents;
	}

	static async get(collection) {
		const doc = await firebase
			.firestore()
			.collection('counters')
			.doc(collection)
			.get();
		return new Counter(doc.id, doc.data().count, doc.data().documents);
	}

	static getListener(collection) {
		return firebase.firestore().collection('counters').doc(collection);
	}
}
