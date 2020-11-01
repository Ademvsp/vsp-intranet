import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('collection-data');

export default class CollectionData {
  constructor({ collection, documents }) {
    this.collection = collection;
    this.documents = documents;
  }

  static async get(document) {
    const doc = await collectionRef.doc(document).get();
    return new CollectionData({ ...doc.data(), collection: doc.id });
  }

  static getListener(document) {
    return collectionRef.doc(document);
  }

  static getNestedListener({ document, subCollection, subCollectionDoc }) {
    return collectionRef
      .doc(document)
      .collection(subCollection)
      .doc(subCollectionDoc);
  }
}
