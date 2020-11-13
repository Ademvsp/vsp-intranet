const admin = require('firebase-admin');
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
    const doc = await admin
      .firestore()
      .collection('locations-new')
      .doc(locationId)
      .get();
    return new Location({ ...doc.data(), locationId: doc.id });
  }

  static async getAll() {
    const collection = await admin
      .firestore()
      .collection('locations-new')
      .orderBy('state', 'asc')
      .get();
    const locations = collection.docs.map((doc) => {
      return new Location({
        ...doc.data(),
        locationId: doc.id
      });
    });
    return locations;
  }
};
