import { CREATE, UPDATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('resources');

export default class Resource {
  constructor({ resourceId, actions, folder, metadata, name }) {
    this.actions = actions;
    this.resourceId = resourceId;
    this.folder = folder;
    this.metadata = metadata;
    this.name = name;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.resourceId;
    return databaseObject;
  }

  static getListener() {
    return collectionRef.orderBy('folder', 'asc').orderBy('name', 'asc');
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('resrouces')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }
}
