import { REQUESTED } from '../data/leave-request-status-types';
import firebase, { getServerTimeInMilliseconds } from '../utils/firebase';
import Permission from './permission';
const collectionRef = firebase.firestore().collection('leave-requests');

export default class LeaveRequest {
  constructor({
    leaveRequestId,
    actions,
    comments,
    end,
    manager,
    metadata,
    reason,
    start,
    status,
    type,
    user
  }) {
    this.leaveRequestId = leaveRequestId;
    this.actions = actions;
    this.comments = comments;
    this.end = end;
    this.manager = manager;
    this.metadata = metadata;
    this.reason = reason;
    this.start = start;
    this.status = status;
    this.type = type;
    this.user = user;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.leaveRequestId;
    return databaseObject;
  }

  static async getPermissions() {
    const userId = firebase.auth().currentUser.uid;
    const permissions = await Permission.get('leave-requests');
    for (const group in permissions.groups) {
      permissions.groups[group] = permissions.groups[group].includes(userId);
    }
    return permissions.groups;
  }

  static getListener(leaveRequestId) {
    return collectionRef.doc(leaveRequestId);
  }

  async save() {
    const serverTime = await getServerTimeInMilliseconds();
    if (!this.leaveRequestId) {
      this.metadata = {
        createdAt: new Date(serverTime),
        createdBy: firebase.auth().currentUser.uid,
        updatedAt: new Date(serverTime),
        updatedBy: firebase.auth().currentUser.uid
      };
      this.actions = [
        {
          actionType: REQUESTED,
          actionedAt: new Date(serverTime),
          actionedBy: firebase.auth().currentUser.uid
        }
      ];
      const docRef = await collectionRef.add(this.getDatabaseObject());
      this.leaveRequestId = docRef.id;
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
    await collectionRef.doc(this.leaveRequestId).update({
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
    await collectionRef.doc(this.leaveRequestId).update({
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
    await collectionRef.doc(this.leaveRequestId).update({
      comments: this.comments
    });
  }
}
