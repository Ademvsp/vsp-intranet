import firebase from '../utils/firebase';

export default class CollectionData {
	constructor({ collection, count, documents }) {
		this.collection = collection;
		this.count = count;
		this.documents = documents;
	}

	static async get(document) {
		const doc = await firebase
			.firestore()
			.collection('collection-data')
			.doc(document)
			.get();
		return new CollectionData({ ...doc.data(), collection: doc.id });
	}

	static async updateCollectionData(document, docId) {
		await firebase
			.firestore()
			.collection('collection-data')
			.doc(document)
			.set(
				{
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(docId)
				},
				{
					merge: true
				}
			);
	}

	static async updateSubCollectionData(
		document,
		subCollection,
		subCollectionDoc,
		docId
	) {
		await firebase
			.firestore()
			.collection('collection-data')
			.doc(document)
			.collection(subCollection)
			.doc(subCollectionDoc)
			.set(
				{
					count: firebase.firestore.FieldValue.increment(1),
					documents: firebase.firestore.FieldValue.arrayUnion(docId)
				},
				{
					merge: true
				}
			);
	}

	static getListener(document) {
		return firebase.firestore().collection('collection-data').doc(document);
	}

	static getNestedListener(document, subCollection, subCollectionDoc) {
		return firebase
			.firestore()
			.collection('collection-data')
			.doc(document)
			.collection(subCollection)
			.doc(subCollectionDoc);
	}
}
