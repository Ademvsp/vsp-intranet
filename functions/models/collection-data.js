const admin = require('firebase-admin');
const collectionRef = admin.firestore().collection('collection-data');

module.exports = class CollectionData {
  constructor({ collection, documents }) {
    this.collection = collection;
    this.documents = documents;
  }

  static async get(collection) {
    const doc = await collectionRef.doc(collection).get();
    const collectionData = new CollectionData({
      collection: doc.id,
      ...doc.data()
    });
    return collectionData;
  }

  static async addCollectionData({ document, docId }) {
    const docRef = collectionRef.doc(document);
    //Check is doc exists first, as arrayUnion will not work if there is no array present
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({
        documents: []
      });
    }
    await collectionRef
      .doc(document)
      .update({ documents: admin.firestore.FieldValue.arrayUnion(docId) });
  }

  static async deleteCollectionData({ document, docId }) {
    const docRef = collectionRef.doc(document);
    //Check is doc exists first and the field before doing an arrayRemove
    const doc = await docRef.get();
    if (doc.exists && doc.data().documents) {
      await admin
        .firestore()
        .collection('collection-data')
        .doc(document)
        .update({ documents: admin.firestore.FieldValue.arrayRemove(docId) });
    }
  }

  static async addSubCollectionData({
    document,
    subCollection,
    subCollectionDoc,
    docId
  }) {
    const docRef = collectionRef
      .doc(document)
      .collection(subCollection)
      .doc(subCollectionDoc);
    //Check is doc exists first, as arrayUnion will not work if there is no array present
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({
        documents: [docId]
      });
    } else {
      await docRef.update({
        documents: admin.firestore.FieldValue.arrayUnion(docId)
      });
    }
  }
};
