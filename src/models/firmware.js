import { CREATE, UPDATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('firmwares-new');

export default class Firmware {
  constructor({
    firmwareId,
    actions,
    attachments,
    body,
    comments,
    metadata,
    products,
    title,
    user
  }) {
    this.firmwareId = firmwareId;
    this.actions = actions;
    this.attachments = attachments;
    this.body = body;
    this.comments = comments;
    this.metadata = metadata;
    this.products = products;
    this.title = title;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.firmwareId;
    return databaseObject;
  }

  static getListener() {
    return collectionRef.orderBy('metadata.createdAt', 'desc');
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('firmwares')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.firmwareId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions[this.actions.length - 1] = {
        actionType: UPDATE,
        actionedAt: new Date(serverTime),
        actionedBy: firebase.auth().currentUser.uid,
        //notifyUsers from the job-document actions
        notifyUsers: this.actions[this.actions.length - 1].notifyUsers
      };
      await collectionRef.doc(this.firmwareId).update(this.getDatabaseObject());
    } else {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          actionType: CREATE,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid,
          //notifyUsers from the firmwares-new actions
          notifyUsers: this.actions[0].notifyUsers
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      const firmwareId = docRef.id;
      this.firmwareId = firmwareId;
    }
  }

  async saveComment(body, attachments, notifyUsers, serverTime) {
    const comment = {
      attachments: attachments,
      body: body,
      likes: [],
      metadata: {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      },
      notifyUsers: notifyUsers,
      user: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.firmwareId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
    this.comments.push(comment);
  }

  async delete() {
    await collectionRef.doc(this.firmwareId).delete();
  }

  async toggleCommentLike(index) {
    const userId = firebase.auth().currentUser.uid;
    const indexOfLike = this.comments[index].likes.indexOf(userId);
    if (indexOfLike === -1) {
      this.comments[index].likes.push(userId);
    } else {
      this.comments[index].likes.splice(indexOfLike, 1);
    }
    await collectionRef.doc(this.firmwareId).update({
      comments: this.comments
    });
  }
}
