import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('app-data');

export default class App {
  constructor({ build }) {
    this.build = build;
  }

  static getBuildListener() {
    return collectionRef.doc('build');
  }
}
