import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('permissions');

export default class Permission {
  constructor({ collection, groups }) {
    this.collection = collection;
    this.groups = groups;
  }

  static getListener() {
    return firebase.firestore().collection('permissions');
  }

  static async set(collection, group, members) {
    await collectionRef.doc(collection).update({
      [group]: members
    });
  }

  static async get(collection) {
    const doc = await collectionRef.doc(collection).get();
    const permission = new Permission({
      collection: collection,
      groups: doc.data()
    });
    return permission;
  }

  static async getAll() {
    const collection = await collectionRef.get();
    const permissions = collection.docs.map(
      (doc) => new Permission({ collection: doc.id, groups: doc.data() })
    );
    return permissions;
  }
}
