import { EXTERNAL, INTERNAL } from '../data/source-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('vendors-new');
export default class Vendor {
  constructor({ vendorId, metadata, name }) {
    this.metadata = metadata;
    this.vendorId = vendorId;
    this.name = name;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (!this.vendorId) {
      const docRef = await collectionRef.add({
        metadata: {
          createdAt: new Date(serverTime),
          createdBy: firebase.auth().currentUser.uid,
          updatedAt: new Date(serverTime),
          updatedBy: firebase.auth().currentUser.uid
        },
        name: this.name,
        source: INTERNAL,
        sourceId: null
      });
      this.vendorId = docRef.id;
    }
  }

  static async saveAllExternal(vendors) {
    const serverTime = await getServerTimeInMilliseconds();
    let batch = firebase.firestore().batch();
    let count = 0;
    const promises = [];
    for (const [index, vendoor] of vendors.entries()) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        metadata: {
          createdAt: new Date(serverTime),
          createdBy: firebase.auth().currentUser.uid,
          updatedAt: new Date(serverTime),
          updatedBy: firebase.auth().currentUser.uid
        },
        name: vendoor.name,
        source: EXTERNAL,
        sourceId: vendoor.sourceId
      });
      count++;
      if (count === 500 || index === vendors.length - 1) {
        promises.push(batch.commit());
        count = 0;
        batch = firebase.firestore().batch();
      }
    }
    await Promise.all(promises);
  }

  static getExternalListener() {
    return collectionRef.where('source', '==', EXTERNAL).orderBy('name', 'asc');
  }

  static getListener() {
    return collectionRef.orderBy('name', 'asc');
  }
}
