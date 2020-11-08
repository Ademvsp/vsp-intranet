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
    const result = await functionRef({
      values: values
    });
    return result.data;
  }

  static async update(userId, values) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-updateUser');
    const result = await functionRef({
      userId: userId,
      values: values
    });
    return result.data;
  }

  static async updatePassword(userId, password) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-updatePassword');
    const result = await functionRef({
      userId: userId,
      password: password
    });
    return result.data;
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

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static getListener() {
    return collectionRef.orderBy('firstName', 'asc');
  }
}
