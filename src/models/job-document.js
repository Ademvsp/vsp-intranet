import { CREATE, UPDATE } from '../utils/actions';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('job-documents');

export default class JobDocument {
  constructor({
    jobDocumentId,
    actions,
    attachments,
    body,
    comments,
    customer,
    metadata,
    salesOrder,
    siteReference,
    user
  }) {
    this.jobDocumentId = jobDocumentId;
    this.actions = actions;
    this.attachments = attachments;
    this.body = body;
    this.comments = comments;
    this.customer = customer;
    this.metadata = metadata;
    this.salesOrder = salesOrder;
    this.siteReference = siteReference;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.jobDocumentId;
    return databaseObject;
  }

  static getListener() {
    return collectionRef.orderBy('metadata.createdAt', 'desc');
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('job-documents')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.jobDocumentId) {
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
      await collectionRef
        .doc(this.jobDocumentId)
        .update(this.getDatabaseObject());
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
          //notifyUsers from the job-documents actions
          notifyUsers: this.actions[0].notifyUsers
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      const jobDocumentId = docRef.id;
      this.jobDocumentId = jobDocumentId;
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
    await collectionRef.doc(this.jobDocumentId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
    this.comments.push(comment);
  }

  async delete() {
    await collectionRef.doc(this.jobDocumentId).delete();
  }

  async toggleCommentLike(index) {
    const userId = firebase.auth().currentUser.uid;
    const indexOfLike = this.comments[index].likes.indexOf(userId);
    if (indexOfLike === -1) {
      this.comments[index].likes.push(userId);
    } else {
      this.comments[index].likes.splice(indexOfLike, 1);
    }
    await collectionRef.doc(this.jobDocumentId).update({
      comments: this.comments
    });
  }
}
