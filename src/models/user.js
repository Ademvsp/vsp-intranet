import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('users-new');

export default class User {
  constructor({
    userId,
    active,
    email,
    extension,
    firstName,
    lastName,
    location,
    manager,
    phone,
    profilePicture,
    title,
    workFromHome
  }) {
    this.userId = userId;
    this.active = active;
    this.email = email;
    this.extension = extension;
    this.firstName = firstName;
    this.lastName = lastName;
    this.location = location;
    this.manager = manager;
    this.phone = phone;
    this.profilePicture = profilePicture;
    this.title = title;
    this.workFromHome = workFromHome;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static getListener() {
    return collectionRef.orderBy('firstName', 'asc');
  }
}
