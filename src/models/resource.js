import { CREATE, UPDATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('resources');

export default class Resource {
  constructor({ resourceId, actions, folder, link, metadata, name }) {
    this.actions = actions;
    this.resourceId = resourceId;
    this.folder = folder;
    this.link = link;
    this.metadata = metadata;
    this.name = name;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.resourceId;
    return databaseObject;
  }

  static getListener() {
    return collectionRef.orderBy('folder', 'asc');
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('resources')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.resourceId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions[this.actions.length - 1] = {
        actionType: UPDATE,
        actionedAt: new Date(serverTime),
        actionedBy: firebase.auth().currentUser.uid
      };
      await collectionRef.doc(this.resourceId).update(this.getDatabaseObject());
    } else {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          actionType: CREATE,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      const resourceId = docRef.id;
      this.resourceId = resourceId;
    }
  }

  async delete() {
    await collectionRef.doc(this.resourceId).delete();
  }
}
