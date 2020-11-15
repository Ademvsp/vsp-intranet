import { SUBMITTED } from '../data/expense-claim-status-types';
import { DAY_IN_MILLISECONDS } from '../utils/date';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import Permission from './permission';
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
    status,
    user
  }) {
    this.expenseClaimId = expenseClaimId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.expenses = expenses;
    this.manager = manager;
    this.metadata = metadata;
    this.status = status;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.expenseClaimId;
    return databaseObject;
  }

  static async getPermissions() {
    const userId = firebase.auth().currentUser.uid;
    const permissions = await Permission.get('expense-claims');
    for (const group in permissions.groups) {
      permissions.groups[group] = permissions.groups[group].includes(userId);
    }
    return permissions.groups;
  }

  static getListener(expenseClaimId) {
    return collectionRef.doc(expenseClaimId);
  }

  static async isWithinDays(days) {
    const serverTimeInMilliseconds = await getServerTimeInMilliseconds();
    const milliseconds = days * DAY_IN_MILLISECONDS;
    const daysAgoInMilliseconds = serverTimeInMilliseconds - milliseconds;
    const daysAgoDate = new Date(daysAgoInMilliseconds);
    const daysAgoTimestamp = firebase.firestore.Timestamp.fromDate(daysAgoDate);
    const collection = await collectionRef
      .where('user', '==', firebase.auth().currentUser.uid)
      .where('metadata.createdAt', '>=', daysAgoTimestamp)
      .get();
    return collection.docs.length > 0;
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
      metadata: metadata,
      status: actionType
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
