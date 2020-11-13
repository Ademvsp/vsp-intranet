import firebase from '../utils/firebase';
const collectionRef = firebase.firestore().collection('app-data');

export default class App {
  constructor({ build }) {
    this.build = build;
  }

  static async getBuild() {
    const doc = await collectionRef.doc('build').get();
    const history = doc.data().build;
    const build = history.pop();
    return build;
  }
}
