import Compressor from 'compressorjs';
import firebase from '../utils/firebase';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;
const collectionRef = firebase.firestore().collection('users');
export default class AuthUser {
  constructor({
    userId,
    admin,
    email,
    firstName,
    lastName,
    location,
    manager,
    metadata,
    profilePicture,
    settings
  }) {
    this.userId = userId;
    this.admin = admin;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.location = location;
    this.manager = manager;
    this.metadata = metadata;
    this.profilePicture = profilePicture;
    this.settings = settings;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static getAuth() {
    return firebase.auth();
  }

  static getServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  static getAuthListener(userId) {
    return collectionRef.doc(userId);
  }

  async removeProfilePicture() {
    const userProfilePicturePath = `users/${this.userId}/profile-picture`;
    const listAll = await firebase
      .storage()
      .ref(userProfilePicturePath)
      .listAll();
    const promises = [];
    for (const item of listAll.items) {
      promises.push(firebase.storage().ref(item.fullPath).delete());
    }
    this.profilePicture = '';
    promises.push(this.save());
    await Promise.all(promises);
  }

  async uploadProfilePicture(file) {
    if (!file.type.includes('image')) {
      throw new Error('Invalid image format');
    }
    const resizedFile = await new Promise((resolve, reject) => {
      return new Compressor(file, {
        strict: true,
        width: 400,
        quality: 0.8,
        convertSize: 1,
        success: (result) => {
          resolve(
            new File([result], file.name, {
              type: file.type,
              lastModified: file.lastModified
            })
          );
        },
        error: (error) => reject(error)
      });
    });
    const userProfilePicturePath = `users/${this.userId}/profile-picture`;
    const listAll = await firebase
      .storage()
      .ref(userProfilePicturePath)
      .listAll();
    const promises = [];
    //Delete all existing profile pictures in user folder
    for (const item of listAll.items) {
      promises.push(firebase.storage().ref(item.fullPath).delete());
    }
    await Promise.all(promises);
    //Upload image, then use snapshot in promise to update profilePicture property in the user database
    const uploadResult = await firebase
      .storage()
      .ref(`${userProfilePicturePath}/${resizedFile.name}`)
      .put(resizedFile);
    const downloadUrl = await firebase
      .storage()
      .ref(uploadResult.ref.fullPath)
      .getDownloadURL();
    this.profilePicture = downloadUrl;
    await this.save();
  }

  async save() {
    const metadata = {
      ...this.metadata,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.userId).update({
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      location: this.location,
      manager: this.manager,
      metadata: metadata,
      profilePicture: this.profilePicture,
      settings: this.settings
    });
  }

  async logout() {
    await firebase.auth().signOut();
  }

  async logoutAll() {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-revokeCurrentRefreshTokens');
    await functionRef();
    await this.logout();
  }

  static async getPhoneNumber(email) {
    const functionRef = firebase
      .app()
      .functions(region)
      .httpsCallable('authFunctions-getAuthPhoneNumber');
    const result = await functionRef({ email });
    return result.data;
  }

  static async signInWithPhoneNumber(phoneNumber, appVerifier) {
    const result = await firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier);
    return result;
  }

  static async confirmVerificationCode(confirmationResult, verificationCode) {
    confirmationResult.confirm(verificationCode);
  }

  static async signInWithEmailAndPassword(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  }
}
