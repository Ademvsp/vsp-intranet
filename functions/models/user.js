const admin = require('firebase-admin');
const Location = require('./location');
const collectionRef = admin.firestore().collection('users');
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

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.userId;
    return databaseObject;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  async getTimezone() {
    const location = await Location.get(this.location);
    return location.timezone;
  }

  static async getAll() {
    const collection = await collectionRef.get();
    const users = collection.docs.map(
      (doc) => new User({ ...doc.data(), userId: doc.id })
    );
    return users;
  }

  static async get(userId) {
    const doc = await collectionRef.doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return new User({
      ...doc.data(),
      userId: doc.id
    });
  }

  async save({ authPhone, adminPermission, updatedBy }) {
    const promises = [];
    if (this.userId) {
      //Perform this first to make sure authPhone is accepted, and no error is thrown
      promises.push(
        admin.auth().updateUser(this.userId, {
          email: this.email,
          phoneNumber: authPhone,
          displayName: `${this.firstName} ${this.lastName}`,
          disabled: !this.active
        }),
        //Update firestore record
        collectionRef.doc(this.userId).update({
          active: this.active,
          email: this.email,
          extension: this.extension,
          firstName: this.firstName,
          lastName: this.lastName,
          location: this.location,
          manager: this.manager,
          'metadata.updatedBy': updatedBy,
          'metadata.updatedAt': new Date(),
          phone: this.phone,
          title: this.title
        }),
        //Update custom claim for admin, perform this before firestore update, as firestore update will trigger onSnapshot change on client which will check admin custom claim
        admin
          .auth()
          .setCustomUserClaims(this.userId, { admin: adminPermission })
      );
    } else {
      //Create the auth() user first to get the userId to work with
      const userRecord = await admin.auth().createUser({
        email: this.email,
        phoneNumber: authPhone,
        emailVerified: true,
        displayName: `${this.firstName} ${this.lastName}`
      });
      this.userId = userRecord.uid;
      promises.push(
        collectionRef.doc(this.userId).create(this.getDatabaseObject()),
        admin
          .auth()
          .setCustomUserClaims(this.userId, { admin: adminPermission })
      );
    }
    await Promise.all(promises);
  }
};
