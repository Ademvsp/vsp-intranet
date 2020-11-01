import { SUBMITTED } from '../data/expense-claim-status-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
const collectionRef = firebase.firestore().collection('expense-claims');
export default class ExpenseClaim {
  constructor({
    expenseClaimId,
    actions,
    attachments,
    comments,
    expenses,
    manager,
    metadata,
    user
  }) {
    this.expenseClaimId = expenseClaimId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.expenses = expenses;
    this.manager = manager;
    this.metadata = metadata;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.expenseClaimId;
    return databaseObject;
  }

  static async isAdmin() {
    const docRef = await firebase
      .firestore()
      .collection('permissions')
      .doc('expense-claims')
      .collection('admins')
      .doc(firebase.auth().currentUser.uid)
      .get();
    return docRef.exists;
  }

  static getListener(expenseClaimId) {
    return collectionRef.doc(expenseClaimId);
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (this.expenseClaimId) {
      this.metadata = {
        ...this.metadata,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      await collectionRef
        .doc(this.expenseClaimId)
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
          actionType: SUBMITTED,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      this.expenseClaimId = docRef.id;
    }
  }

  async saveComment(body, attachments, serverTime) {
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
      user: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.expenseClaimId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(comment)
    });
    this.comments.push(comment);
  }

  async saveAction(actionType) {
    const serverTime = await getServerTimeInMilliseconds();
    const action = {
      actionType: actionType,
      actionedAt: new Date(serverTime),
      actionedBy: firebase.auth().currentUser.uid
    };
    const metadata = {
      ...this.metadata,
      updatedAt: new Date(serverTime),
      updatedBy: firebase.auth().currentUser.uid
    };
    await collectionRef.doc(this.expenseClaimId).update({
      actions: firebase.firestore.FieldValue.arrayUnion(action),
      metadata: metadata
    });
    this.metadata = metadata;
    this.actions = [...this.actions, action];
  }

  async toggleCommentLike(index) {
    const userId = firebase.auth().currentUser.uid;
    const indexOfLike = this.comments[index].likes.indexOf(userId);
    if (indexOfLike === -1) {
      this.comments[index].likes.push(userId);
    } else {
      this.comments[index].likes.splice(indexOfLike, 1);
    }
    await collectionRef.doc(this.expenseClaimId).update({
      comments: this.comments
    });
  }
}
