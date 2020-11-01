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
        source: 'internal',
        sourceId: null
      });
      this.vendorId = docRef.id;
    }
  }

  static getListener() {
    return collectionRef.orderBy('name', 'asc');
  }
}
