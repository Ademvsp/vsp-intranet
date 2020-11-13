const admin = require('firebase-admin');
const collectionRef = admin.firestore().collection('permissions');

module.exports = class Permission {
  constructor({ collection, groups }) {
    this.collection = collection;
    this.groups = groups;
  }

  static async get(collection) {
    const doc = await collectionRef.doc(collection).get();
    const permission = new Permission({
      collection: collection,
      groups: doc.data()
    });
    return permission;
  }
};
