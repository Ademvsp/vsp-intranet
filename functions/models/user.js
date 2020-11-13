const admin = require('firebase-admin');
const Location = require('./location');
module.exports = class User {
  constructor({
    userId,
    active,
    email,
    extension,
    firstName,
    lastName,
    location,
    manager,
    metadata,
    phone,
    profilePicture,
    settings,
    title
  }) {
    this.userId = userId;
    this.active = active;
    this.email = email;
    this.extension = extension;
    this.firstName = firstName;
    this.lastName = lastName;
    this.location = location;
    this.manager = manager;
    this.metadata = metadata;
    this.phone = phone;
    this.profilePicture = profilePicture;
    this.settings = settings;
    this.title = title;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  async getTimezone() {
    const location = await Location.get(this.location);
    return location.timezone;
  }

  static async getAll() {
    const collection = await admin.firestore().collection('users-new').get();
    const users = collection.docs.map(
      (doc) => new User({ ...doc.data(), userId: doc.id })
    );
    return users;
  }

  static async get(userId) {
    const doc = await admin
      .firestore()
      .collection('users-new')
      .doc(userId)
      .get();
    if (!doc.exists) {
      return null;
    }
    return new User({
      ...doc.data(),
      userId: doc.id
    });
  }
};
