const admin = require('firebase-admin');
const collectionRef = admin.firestore().collection('locations');
module.exports = class Location {
  constructor({
    locationId,
    address,
    branch,
    colors,
    map,
    phone,
    state,
    timezone
  }) {
    this.locationId = locationId;
    this.address = address;
    this.branch = branch;
    this.colors = colors;
    this.map = map;
    this.phone = phone;
    this.state = state;
    this.timezone = timezone;
  }

  static async get(locationId) {
    const doc = await collectionRef.doc(locationId).get();
    return new Location({ ...doc.data(), locationId: doc.id });
  }

  static async getAll() {
    const collection = await collectionRef.orderBy('state', 'asc').get();
    const locations = collection.docs.map((doc) => {
      return new Location({
        ...doc.data(),
        locationId: doc.id
      });
    });
    return locations;
  }
};
