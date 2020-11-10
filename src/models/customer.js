import { EXTERNAL, INTERNAL } from '../data/source-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('customers-new');
export default class Customer {
  constructor({ customerId, metadata, name }) {
    this.customerId = customerId;
    this.metadata = metadata;
    this.name = name;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (!this.customerId) {
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
      this.customerId = docRef.id;
    }
  }

  static async saveAllExternal(customers) {
    const serverTime = await getServerTimeInMilliseconds();
    let batch = firebase.firestore().batch();
    let count = 0;
    const promises = [];

    for (const [index, customer] of customers.entries()) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        metadata: {
          createdAt: new Date(serverTime),
          createdBy: firebase.auth().currentUser.uid,
          updatedAt: new Date(serverTime),
          updatedBy: firebase.auth().currentUser.uid
        },
        name: customer.name,
        source: EXTERNAL,
        sourceId: customer.sourceId
      });
      count++;
      if (count === 500 || index === customers.length - 1) {
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
