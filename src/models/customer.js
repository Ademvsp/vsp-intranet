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
        source: 'internal',
        sourceId: null
      });
      this.customerId = docRef.id;
    }
  }

  static getListener() {
    return collectionRef.orderBy('name', 'asc');
  }
}
