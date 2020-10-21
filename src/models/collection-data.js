import firebase from '../utils/firebase';

export default class CollectionData {
	constructor({ collection, count, documents }) {
		this.collection = collection;
		this.count = count;
		this.documents = documents;
	}

	static async get(collection) {
		const doc = await firebase
			.firestore()
			.collection('collection-data')
			.doc(collection)
			.get();
		return new CollectionData({ ...doc.data(), collection: doc.id });
	}

	static getListener(collection) {
		return firebase.firestore().collection('collection-data').doc(collection);
	}
}
