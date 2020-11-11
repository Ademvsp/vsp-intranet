import firebase from '../utils/firebase';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;
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

  static async getUserAuthData(userId) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-getUserAuthData');
    const result = await functionRef({
      userId: userId
    });
    return result.data;
  }

  static async create(values) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-createUser');
    await functionRef({
      values: values
    });
  }

  static async update(userId, values) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-updateUser');
    await functionRef({
      userId: userId,
      values: values
    });
  }

  static async updatePassword(userId, password) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-updatePassword');
    await functionRef({
      userId: userId,
      password: password
    });
  }

  static async revokeRefreshTokens(userId) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-revokeRefreshTokens');
    const result = await functionRef({
      userId: userId
    });
    return result.data;
  }
}
